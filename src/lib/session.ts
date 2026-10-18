import type { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isCrossSite } from "@/lib/http";

// The creator session: one server-minted, HMAC-signed `{fid, exp}` cookie, set by
// either door (Quick Auth JWT in the mini app, SIWF on the web - see
// lib/farcaster-auth.ts and docs/AUTH-PLAN.md). Every owner action reads the FID
// from here and nowhere else - never from a request body or the mini-app context.
//
// SameSite=None; Secure is required: a Lax cookie is silently dropped inside the
// Farcaster client iframe, which is the mini-app door's whole surface.
//
// Fails CLOSED: with SPARKZ_SESSION_SECRET unset, no session can be minted or read.

export const SESSION_COOKIE = "sparkz_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// The SIWF nonce this server issued (/api/auth/nonce), checked by /api/auth/siwf.
export const NONCE_COOKIE = "sparkz_siwf_nonce";

// Shorter than this and the HMAC key is guessable; refuse to run on it.
const MIN_SECRET_LENGTH = 32;

function secret(): string | null {
  const s = process.env.SPARKZ_SESSION_SECRET;
  return s && s.length >= MIN_SECRET_LENGTH ? s : null;
}

export function sessionConfigured(): boolean {
  return secret() !== null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export interface SessionClaims {
  fid: number | null;
  /** Lowercased address, for a Sign-In with Ethereum session. */
  address: string | null;
}

function mint(claims: { fid?: number; addr?: string }): string | null {
  const key = secret();
  if (!key) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ ...claims, exp })).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

// Mint the cookie value for a verified FID. Returns null when unconfigured.
export function mintSession(fid: number): string | null {
  return mint({ fid });
}

// Mint the cookie value for a verified Ethereum address (SIWE). Null when unconfigured.
export function mintAddressSession(address: string): string | null {
  return mint({ addr: address.toLowerCase() });
}

// Read the verified claims from a cookie value, or null on any failure.
export function readSessionClaims(value: string | undefined): SessionClaims | null {
  const key = secret();
  if (!key || !value) return null;
  const [payload, mac] = value.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload, key));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { fid, addr, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof exp !== "number" || exp < Math.floor(Date.now() / 1000)) return null;
    const validFid = typeof fid === "number" && Number.isInteger(fid) && fid > 0 ? fid : null;
    const validAddr = typeof addr === "string" && /^0x[0-9a-f]{40}$/.test(addr) ? addr : null;
    if (validFid === null && validAddr === null) return null;
    return { fid: validFid, address: validAddr };
  } catch {
    return null;
  }
}

// Read the verified FID from a cookie value, or null on any failure.
export function readSession(value: string | undefined): number | null {
  return readSessionClaims(value)?.fid ?? null;
}

// The session as seen by a route. The cookie is SameSite=None (the Farcaster iframe
// needs that), so the browser attaches it to requests started by other sites too. A
// cross-site request is treated as having NO session: this one check protects every
// owner and admin route at once, including GETs and routes without their own
// forbidCrossSite. Requests from our own pages (including the mini app, which runs on
// our origin inside the Farcaster frame) are same-origin and unaffected.
export function sessionClaims(req: NextRequest): SessionClaims | null {
  if (isCrossSite(req)) return null;
  return readSessionClaims(req.cookies.get(SESSION_COOKIE)?.value);
}

export function sessionFid(req: NextRequest): number | null {
  return sessionClaims(req)?.fid ?? null;
}

// Cross-site cookie options. Secure is mandatory with SameSite=None, so in local
// dev over http://localhost we fall back to Lax (the iframe case only exists in prod).
export function crossSiteCookie(maxAge: number) {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge,
  };
}

export function setSessionCookie(res: NextResponse, value: string): void {
  res.cookies.set(SESSION_COOKIE, value, crossSiteCookie(SESSION_MAX_AGE));
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", crossSiteCookie(0));
}

// SIWF nonce cookie: `${nonce}.${issuedAt}.${mac}`. Signed with the session secret
// so a client cannot set its own nonce cookie to match a leaked signed message;
// the issue time bounds replay to NONCE_MAX_AGE.
export const NONCE_MAX_AGE = 60 * 10; // 10 minutes to finish signing in

export function mintNonceCookie(nonce: string): string | null {
  const key = secret();
  if (!key) return null;
  const body = `${nonce}.${Math.floor(Date.now() / 1000)}`;
  return `${body}.${sign(body, key)}`;
}

// The nonce from a valid, unexpired nonce cookie, or null.
export function readNonceCookie(value: string | undefined): string | null {
  const key = secret();
  if (!key || !value) return null;
  const [nonce, iat, mac] = value.split(".");
  if (!nonce || !iat || !mac) return null;
  const expected = Buffer.from(sign(`${nonce}.${iat}`, key));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const age = Math.floor(Date.now() / 1000) - Number(iat);
  if (!Number.isFinite(age) || age < 0 || age > NONCE_MAX_AGE) return null;
  return nonce;
}

// Single-use: a nonce is accepted once. The signed cookie alone bounds replay to
// NONCE_MAX_AGE; this closes the window inside one server instance. Entries expire
// with the nonce, so the set stays small. (Across separate serverless instances a
// replay inside the 10 minutes is still possible; a shared store would close that.)
const usedNonces = new Map<string, number>();

export function consumeNonce(nonce: string): boolean {
  const now = Date.now();
  for (const [n, until] of usedNonces) if (until < now) usedNonces.delete(n);
  if (usedNonces.has(nonce)) return false;
  usedNonces.set(nonce, now + NONCE_MAX_AGE * 1000);
  return true;
}

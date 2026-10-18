import type { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

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

// Mint the cookie value for a verified FID. Returns null when unconfigured.
export function mintSession(fid: number): string | null {
  const key = secret();
  if (!key) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ fid, exp })).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

// Read the verified FID from a cookie value, or null on any failure.
export function readSession(value: string | undefined): number | null {
  const key = secret();
  if (!key || !value) return null;
  const [payload, mac] = value.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload, key));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { fid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof fid !== "number" || !Number.isInteger(fid) || fid <= 0) return null;
    if (typeof exp !== "number" || exp < Math.floor(Date.now() / 1000)) return null;
    return fid;
  } catch {
    return null;
  }
}

export function sessionFid(req: NextRequest): number | null {
  return readSession(req.cookies.get(SESSION_COOKIE)?.value);
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

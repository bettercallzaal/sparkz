import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/server";
import { sessionFid } from "@/lib/session";

// Operator authz for the service-role API routes. Because the service client
// BYPASSES RLS (checklist point 3), every mutating route must do its own authz
// check - RLS will not save us there. m1 is a single-operator console, so this is
// a shared admin token held in an httpOnly cookie (set via /api/admin/login).
// Owner-scoped writes go through requireHearthOwner below: the creator's FID comes
// from the verified session (lib/session.ts), never from the request.
//
// Fails CLOSED: if SPARKZ_ADMIN_TOKEN is unset, no writes are allowed at all.

export const ADMIN_COOKIE = "sparkz_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8h

// Set the operator session cookie on a response. Shared by /api/admin/login (prod
// path, token from the operator) and /api/admin/dev-login (dev-only convenience).
// httpOnly so the raw token never touches client JS; secure only in production so
// the cookie still sets over http://localhost in dev.
export function setAdminCookie(res: NextResponse, token: string): void {
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyAdminToken(token: string): boolean {
  const expected = process.env.SPARKZ_ADMIN_TOKEN;
  if (!expected) return false;
  return safeEqual(token, expected);
}

// Boolean predicate: is this request from the operator? For routes that stay open
// to the public but want to grant the operator an exemption (e.g. skip the
// self-serve rate limit) without returning a 401.
export function isAdmin(req: NextRequest): boolean {
  const expected = process.env.SPARKZ_ADMIN_TOKEN;
  if (!expected) return false;
  const provided =
    req.cookies.get(ADMIN_COOKIE)?.value ??
    req.headers.get("x-sparkz-admin-token") ??
    "";
  return safeEqual(provided, expected);
}

// Returns null when authorized; otherwise the response to return immediately.
export function requireAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.SPARKZ_ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Admin auth not configured (set SPARKZ_ADMIN_TOKEN)" },
      { status: 503 },
    );
  }
  const provided =
    req.cookies.get(ADMIN_COOKIE)?.value ??
    req.headers.get("x-sparkz-admin-token") ??
    "";
  if (!safeEqual(provided, expected)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Owner-or-operator gate for one Hearth. Allows the request when the verified
// session FID equals hearths.owner_fid, or when the operator token passes. Both
// paths fail closed: no session, no owner, or an unknown Hearth is a 401/404.
// Returns null when authorized; otherwise the response to return immediately.
export async function requireHearthOwner(
  req: NextRequest,
  hearthId: string,
): Promise<NextResponse | null> {
  if (isAdmin(req)) return null;

  const fid = sessionFid(req);
  if (!fid) {
    return NextResponse.json({ ok: false, error: "Sign in to manage this Hearth" }, { status: 401 });
  }

  const { data, error } = await getServiceClient()
    .from("hearths")
    .select("owner_fid")
    .eq("id", hearthId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return NextResponse.json({ ok: false, error: "hearth not found" }, { status: 404 });

  // owner_fid is bigint in Postgres; compare as numbers.
  if (data.owner_fid == null || Number(data.owner_fid) !== fid) {
    return NextResponse.json({ ok: false, error: "Only this Hearth's owner can do that" }, { status: 403 });
  }
  return null;
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

// Operator authz for the service-role API routes. Because the service client
// BYPASSES RLS (checklist point 3), every mutating route must do its own authz
// check - RLS will not save us there. m1 is a single-operator console, so this is
// a shared admin token held in an httpOnly cookie (set via /api/admin/login).
// Per-creator, owner-scoped auth (Farcaster SIWF / wallet) lands with real user
// accounts in a later milestone; until then writes are operator-only.
//
// Fails CLOSED: if SPARKZ_ADMIN_TOKEN is unset, no writes are allowed at all.

export const ADMIN_COOKIE = "sparkz_admin";

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

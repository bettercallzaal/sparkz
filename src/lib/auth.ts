import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/server";
import { sessionClaims, sessionFid } from "@/lib/session";

import { isAdminAddress, isAdminFid } from "@/lib/admin-identities";

// Operator (admin) authz for the service-role API routes. Because the service client
// BYPASSES RLS (checklist point 3), every mutating route must do its own authz
// check - RLS will not save us there.
//
// Two kinds of admin (Zaal's ruling, 2026-10-18):
//   - A human, signed in with a verified session (lib/session.ts) as an allowlisted
//     identity (lib/admin-identities.ts): Farcaster FID 19640, or zaal.eth's address
//     via Sign-In with Ethereum. No human types the admin token any more.
//   - The background agent, sending SPARKZ_ADMIN_TOKEN as the x-sparkz-admin-token
//     header - a machine credential only. There is no cookie or login route for it.
// Owner-scoped writes go through requireHearthOwner below.
//
// Fails CLOSED: no session and no (configured, matching) token means no admin.

export const ADMIN_TOKEN_HEADER = "x-sparkz-admin-token";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// The background agent's machine credential. Scoped (backend review, 2026-11-19): it
// opens only the routes the agent calls (requireAdminOrAgent / isAdminOrAgent below),
// never the admin or Hearth-owner routes, so a token leaked from the agent host cannot
// edit Hearths, upload, link empires or change plugin config.
// SPARKZ_AGENT_TOKEN is the name going forward; SPARKZ_ADMIN_TOKEN is still read so the
// running agent keeps working. Rotation: set the new value as SPARKZ_AGENT_TOKEN, move the
// agent to it, then delete SPARKZ_ADMIN_TOKEN. Both are accepted while both are set.
function hasAgentToken(req: NextRequest): boolean {
  const sent = req.headers.get(ADMIN_TOKEN_HEADER) ?? "";
  if (!sent) return false;
  return [process.env.SPARKZ_AGENT_TOKEN, process.env.SPARKZ_ADMIN_TOKEN].some(
    (expected) => typeof expected === "string" && expected.length > 0 && safeEqual(sent, expected),
  );
}

// A human admin: a verified session whose FID or address is on the allowlist.
export function isAdminSession(req: NextRequest): boolean {
  const claims = sessionClaims(req);
  return isAdminFid(claims?.fid) || isAdminAddress(claims?.address);
}

// Boolean predicate: is this request from an admin? For routes that stay open to the
// public but grant an admin an exemption (e.g. skip the self-serve rate limit).
// A human admin session only: the agent token is not admin (see hasAgentToken).
export function isAdmin(req: NextRequest): boolean {
  return isAdminSession(req);
}

// Returns null when authorized; otherwise the response to return immediately.
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (isAdmin(req)) return null;
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

// The routes the background agent calls (agent/src/sparkz.ts): the capsules list, the
// signals list, create and approve, signal detection and receipts. A human admin or the
// agent token.
export function isAdminOrAgent(req: NextRequest): boolean {
  return isAdminSession(req) || hasAgentToken(req);
}

export function requireAdminOrAgent(req: NextRequest): NextResponse | null {
  if (isAdminOrAgent(req)) return null;
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

// Owner-or-operator gate for one Hearth. Allows the request when the verified
// session FID equals hearths.owner_fid, or when a human admin session is present. Both
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

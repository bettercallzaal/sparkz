import type { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/http";
import { sessionClaims } from "@/lib/session";
import { isAdmin, isAdminSession } from "@/lib/auth";
import { ALPHA_LOCK } from "@/lib/alpha-access";

// GET /api/auth/me - the current verified session: its FID or address (or nulls) and
// whether it is an admin. Lets the client know whether the server-side session exists
// (auth-kit's or the wallet's own client state is not proof of anything to the server).
export async function GET(req: NextRequest) {
  try {
    const claims = sessionClaims(req);
    return ok({
      fid: claims?.fid ?? null,
      address: claims?.address ?? null,
      admin: isAdminSession(req),
      // Can this visitor use the public write actions (Boost, join the team)? While the
      // private alpha is locked, only a session can (and only listed people can hold one),
      // so the UI shows the waitlist up front instead of a form that fails on submit.
      writesOpen: !ALPHA_LOCK || claims !== null || isAdmin(req),
      alphaLock: ALPHA_LOCK,
    });
  } catch (err) {
    return serverError(err, "auth.me.GET");
  }
}

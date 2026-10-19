import type { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/http";
import { sessionClaims } from "@/lib/session";
import { isAdminSession } from "@/lib/auth";

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
    });
  } catch (err) {
    return serverError(err, "auth.me.GET");
  }
}

import type { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/http";
import { sessionFid } from "@/lib/session";

// GET /api/auth/me - the FID of the current verified session, or null. Lets the
// client know whether the server-side session exists (auth-kit's own client state
// is not proof of anything to the server).
export async function GET(req: NextRequest) {
  try {
    return ok({ fid: sessionFid(req) });
  } catch (err) {
    return serverError(err, "auth.me.GET");
  }
}

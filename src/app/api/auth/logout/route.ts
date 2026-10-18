import type { NextRequest } from "next/server";
import { ok, serverError, forbidCrossSite } from "@/lib/http";
import { clearSessionCookie } from "@/lib/session";

// POST /api/auth/logout - end the creator session.
export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    const res = ok({ signedOut: true });
    clearSessionCookie(res);
    return res;
  } catch (err) {
    return serverError(err, "auth.logout.POST");
  }
}

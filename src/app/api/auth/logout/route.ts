import { ok, serverError } from "@/lib/http";
import { clearSessionCookie } from "@/lib/session";

// POST /api/auth/logout - end the creator session.
export async function POST() {
  try {
    const res = ok({ signedOut: true });
    clearSessionCookie(res);
    return res;
  } catch (err) {
    return serverError(err, "auth.logout.POST");
  }
}

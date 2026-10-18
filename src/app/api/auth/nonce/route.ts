import { randomBytes } from "node:crypto";
import { ok, serverError } from "@/lib/http";
import { crossSiteCookie, NONCE_COOKIE } from "@/lib/session";

const NONCE_MAX_AGE = 60 * 10; // 10 minutes to finish signing in

// GET /api/auth/nonce - a fresh server-issued nonce for the web (SIWF) door. auth-kit
// puts it in the message the user signs; /api/auth/siwf only accepts a message that
// carries the nonce held in this httpOnly cookie, so a signed message cannot be
// replayed from elsewhere.
export async function GET() {
  try {
    const nonce = randomBytes(16).toString("hex");
    const res = ok({ nonce });
    res.cookies.set(NONCE_COOKIE, nonce, crossSiteCookie(NONCE_MAX_AGE));
    return res;
  } catch (err) {
    return serverError(err, "auth.nonce.GET");
  }
}

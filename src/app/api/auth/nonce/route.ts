import { randomBytes } from "node:crypto";
import { ok, serverError } from "@/lib/http";
import { NextResponse } from "next/server";
import { crossSiteCookie, mintNonceCookie, NONCE_COOKIE, NONCE_MAX_AGE } from "@/lib/session";

// GET /api/auth/nonce - a fresh server-issued nonce for the web (SIWF) door. auth-kit
// puts it in the message the user signs; /api/auth/siwf only accepts a message that
// carries the nonce held in this signed, time-limited httpOnly cookie (see
// mintNonceCookie), so a signed message cannot be replayed later.
export async function GET() {
  try {
    const nonce = randomBytes(16).toString("hex");
    const cookie = mintNonceCookie(nonce);
    if (!cookie) {
      return NextResponse.json(
        { ok: false, error: "Sign-in not configured (set SPARKZ_SESSION_SECRET)" },
        { status: 503 },
      );
    }
    const res = ok({ nonce });
    res.cookies.set(NONCE_COOKIE, cookie, crossSiteCookie(NONCE_MAX_AGE));
    return res;
  } catch (err) {
    return serverError(err, "auth.nonce.GET");
  }
}

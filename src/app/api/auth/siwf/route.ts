import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ok, serverError, zodError } from "@/lib/http";
import { verifySiwf } from "@/lib/farcaster-auth";
import { crossSiteCookie, mintSession, NONCE_COOKIE, setSessionCookie } from "@/lib/session";

const schema = z.object({
  message: z.string().min(1).max(4000),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/).max(2000),
});

// POST /api/auth/siwf - the web door. Body { message, signature } from auth-kit's
// SignInButton. Verified server-side for this domain and the nonce this server
// issued (/api/auth/nonce), then exchanged for the Sparkz session.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const nonce = req.cookies.get(NONCE_COOKIE)?.value;
    const denied = NextResponse.json(
      { ok: false, error: "Sign-in could not be verified" },
      { status: 401 },
    );
    if (!nonce) return denied;

    let fid: number;
    try {
      fid = await verifySiwf({
        message: parsed.data.message,
        signature: parsed.data.signature as `0x${string}`,
        nonce,
      });
    } catch (verifyErr) {
      console.warn("[sparkz:auth.siwf] rejected:", (verifyErr as Error).message);
      return denied;
    }

    const session = mintSession(fid);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Sign-in not configured (set SPARKZ_SESSION_SECRET)" },
        { status: 503 },
      );
    }
    const res = ok({ fid });
    setSessionCookie(res, session);
    // One nonce, one sign-in.
    res.cookies.set(NONCE_COOKIE, "", crossSiteCookie(0));
    return res;
  } catch (err) {
    return serverError(err, "auth.siwf.POST");
  }
}

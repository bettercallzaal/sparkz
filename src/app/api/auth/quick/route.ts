import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ok, serverError, zodError, forbidCrossSite, tooManyRequests } from "@/lib/http";
import { memoryLimitHit, SIGN_IN_LIMIT, SIGN_IN_WINDOW_MS } from "@/lib/memory-limit";
import { clientIpHash } from "@/lib/rate-limit";
import { ALPHA_CLOSED_MESSAGE, isAlphaAllowed } from "@/lib/alpha-access";
import { verifyQuickAuth } from "@/lib/farcaster-auth";
import { mintSession, setSessionCookie } from "@/lib/session";

const schema = z.object({ token: z.string().min(20).max(4000) });

// POST /api/auth/quick - the mini-app door. Body { token } is a Farcaster Quick Auth
// JWT from sdk.quickAuth.getToken(). Verified against the Farcaster JWKS, then
// exchanged for the Sparkz session. The ~1h JWT itself is never stored.
export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;
    if (memoryLimitHit(`auth:${clientIpHash(req)}`, SIGN_IN_LIMIT, SIGN_IN_WINDOW_MS)) {
      return tooManyRequests("Too many sign-in attempts. Wait a few minutes and try again.");
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    let fid: number;
    try {
      fid = await verifyQuickAuth(parsed.data.token);
    } catch (verifyErr) {
      console.warn("[sparkz:auth.quick] rejected:", (verifyErr as Error).message);
      return NextResponse.json({ ok: false, error: "Sign-in could not be verified" }, { status: 401 });
    }

    // Private alpha (lib/alpha-access.ts): only listed identities get a session.
    if (!isAlphaAllowed({ fid })) {
      return NextResponse.json({ ok: false, error: ALPHA_CLOSED_MESSAGE }, { status: 403 });
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
    return res;
  } catch (err) {
    return serverError(err, "auth.quick.POST");
  }
}

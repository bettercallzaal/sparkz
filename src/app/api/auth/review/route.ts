import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidCrossSite, tooManyRequests, ok, serverError, zodError } from "@/lib/http";
import { memoryLimitHit, SIGN_IN_LIMIT, SIGN_IN_WINDOW_MS } from "@/lib/memory-limit";
import { clientIpHash } from "@/lib/rate-limit";
import { mintAddressSession, setSessionCookie } from "@/lib/session";
import { REVIEW_ADDRESS, reviewCodeMatches, reviewSignInEnabled } from "@/lib/review-sign-in";

// GET  /api/auth/review  { enabled }: whether the reviewer sign-in is on, so the app shows
//                        the code box only during review.
// POST /api/auth/review  { code }: sign in as the fixed review identity (src/lib/review-sign-in.ts).
// Off (404) unless SPARKZ_REVIEW_CODE is set on the server.
const schema = z.object({ code: z.string().min(1).max(200) }).strict();

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({ enabled: reviewSignInEnabled() });
}

export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;
    if (!reviewSignInEnabled()) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    if (memoryLimitHit(`auth:${clientIpHash(req)}`, SIGN_IN_LIMIT, SIGN_IN_WINDOW_MS)) {
      return tooManyRequests("Too many sign-in attempts. Wait a few minutes and try again.");
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    if (!reviewCodeMatches(parsed.data.code)) {
      console.warn("[sparkz:auth.review] rejected: wrong code");
      return NextResponse.json({ ok: false, error: "That code is not right" }, { status: 401 });
    }

    const session = mintAddressSession(REVIEW_ADDRESS);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Sign-in not configured (set SPARKZ_SESSION_SECRET)" },
        { status: 503 },
      );
    }
    const res = ok({ address: REVIEW_ADDRESS, admin: false, review: true });
    setSessionCookie(res, session);
    return res;
  } catch (err) {
    return serverError(err, "auth.review.POST");
  }
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidCrossSite, ok, serverError, zodError } from "@/lib/http";
import { verifySiweLogin } from "@/lib/siwe";
import { isAdminAddress } from "@/lib/admin-identities";
import { CANONICAL_HOST } from "@/lib/origin";
import {
  consumeNonce,
  crossSiteCookie,
  mintAddressSession,
  NONCE_COOKIE,
  readNonceCookie,
  setSessionCookie,
} from "@/lib/session";

const schema = z.object({
  message: z.string().min(1).max(4000),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/).max(2000),
});

// POST /api/auth/siwe - sign-in with an Ethereum wallet (EIP-4361). Body
// { message, signature }. The message must carry the nonce this server issued
// (/api/auth/nonce; signed, 10 minutes, single use), this domain, an allowed chain
// and an explicit expiry (lib/siwe.ts). Every verified wallet gets a member session
// (needed for the first free hat); `admin` in the reply says whether the address is on
// the admin allowlist (lib/admin-identities.ts), and admin routes re-check that themselves.
export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const denied = NextResponse.json(
      { ok: false, error: "Sign-in could not be verified" },
      { status: 401 },
    );
    const nonce = readNonceCookie(req.cookies.get(NONCE_COOKIE)?.value);
    if (!nonce) return denied;

    let address: string;
    try {
      address = await verifySiweLogin({
        message: parsed.data.message,
        signature: parsed.data.signature as `0x${string}`,
        nonce,
        domain: CANONICAL_HOST,
      });
    } catch (verifyErr) {
      console.warn("[sparkz:auth.siwe] rejected:", (verifyErr as Error).message);
      return denied;
    }
    // Spend the nonce only after a valid signature, so a junk request cannot burn
    // the real user's nonce.
    if (!consumeNonce(nonce)) {
      console.warn("[sparkz:auth.siwe] rejected: nonce already used");
      return denied;
    }
    // Any verified wallet gets a session (the first free hat needs one, /api/hats/claim).
    // Admin powers never come from the session alone: every admin route re-checks the
    // allowlist through isAdminSession(), so a member session opens nothing admin.
    const admin = isAdminAddress(address);

    const session = mintAddressSession(address);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Sign-in not configured (set SPARKZ_SESSION_SECRET)" },
        { status: 503 },
      );
    }
    const res = ok({ address, admin });
    setSessionCookie(res, session);
    res.cookies.set(NONCE_COOKIE, "", crossSiteCookie(0));
    return res;
  } catch (err) {
    return serverError(err, "auth.siwe.POST");
  }
}

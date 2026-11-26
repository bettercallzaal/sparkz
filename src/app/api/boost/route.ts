import { NextResponse, type NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { boostSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, tooManyRequests, forbidCrossSite } from "@/lib/http";
import { clientIpHash, boostCountInWindow, BOOST_LIMIT, BOOST_WINDOW_MS } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth";
import { sessionClaims } from "@/lib/session";
import { boosterId } from "@/lib/boost-state";
import { ALPHA_CLOSED_MESSAGE, ALPHA_LOCK } from "@/lib/alpha-access";

// POST /api/boost - public "Boost this Hearth" (the boost engine): a free support
// signal, not a payment. A signed-in backer boosts in one tap: the identity comes from
// the session cookie (FID, or address for a wallet session), never from the body. Records a ledger backing of kind='boost', qty 1. Public
// (not admin-gated). One boost per backer per Hearth (deduped). Dollar backing
// comes later with the fiat/BYOK payment rails.
// Boosting needs sign-in (Zaal, ORD-465: anyone can view, boosting needs sign-in). A
// signed-out boost used to store a typed name or email as the backer; that path is gone,
// so no new backer_id is ever a name or an email.
const SIGN_IN_TO_BOOST = "Sign in to boost";

export async function POST(req: NextRequest) {
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    // Private alpha (lib/alpha-access.ts): this public route is closed to everyone but
    // the listed identities until Sparkz opens.
    const claims = sessionClaims(req);
    if (ALPHA_LOCK && !isAdmin(req) && !claims) {
      return NextResponse.json({ ok: false, error: ALPHA_CLOSED_MESSAGE }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = boostSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    // The session FID (or wallet address) is the identity and the dedupe key.
    // fc_username is stored in metadata as an unverified display hint only.
    const backerId = boosterId(claims);
    if (!backerId) {
      return NextResponse.json({ ok: false, error: SIGN_IN_TO_BOOST }, { status: 401 });
    }
    const supabase = getServiceClient();

    // Per-IP rate limit (operator exempt). Boost is public + unauthenticated, so
    // this is what stops one actor from inflating public counts / spamming rows.
    const ipHash = clientIpHash(req);
    if (!isAdmin(req)) {
      const recent = await boostCountInWindow(ipHash, BOOST_WINDOW_MS);
      if (recent >= BOOST_LIMIT) {
        return tooManyRequests("You have boosted a lot recently. Give it an hour and try again.");
      }
    }

    // Hearth must exist.
    const { data: hearth, error: capErr } = await supabase
      .from("hearths")
      .select("id")
      .eq("id", parsed.data.hearth_id)
      .maybeSingle();
    if (capErr) throw capErr;
    if (!hearth) return badRequest("hearth not found");

    // Dedupe: one boost per backer per Hearth. The unique index from migration 0007 is
    // the real guard; this read only saves an insert in the common case.
    // limit(1), not maybeSingle: a backer who already has two boost rows (from before
    // 0007) must read as deduped, not as a "multiple rows" error.
    const { data: existing, error: dupErr } = await supabase
      .from("hearth_backers")
      .select("id")
      .eq("hearth_id", parsed.data.hearth_id)
      .eq("backer_id", backerId)
      .eq("kind", "boost")
      .limit(1);
    if (dupErr) throw dupErr;
    if (Array.isArray(existing) && existing.length > 0) return ok({ boosted: true, deduped: true }, 200);

    const { error } = await supabase.from("hearth_backers").insert({
      hearth_id: parsed.data.hearth_id,
      backer_kind: "user",
      backer_id: backerId,
      kind: "boost",
      amount_or_qty: 1,
      unit: "boost",
      provider: "ledger",
      metadata: {
        pledge: true,
        ip_hash: ipHash,
        ...(claims?.fid ? { fid: claims.fid } : {}),
        ...(claims?.fid && parsed.data.fc_username
          ? { fc_username: parsed.data.fc_username.toLowerCase() }
          : {}),
      },
    });
    // Two taps at once: the second insert hits hearth_backers_boost_unique (23505).
    if (error?.code === "23505") return ok({ boosted: true, deduped: true }, 200);
    if (error) throw error;

    return ok({ boosted: true }, 201);
  } catch (err) {
    return serverError(err, "boost.POST");
  }
}

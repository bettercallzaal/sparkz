import { NextResponse, type NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { boostSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, tooManyRequests } from "@/lib/http";
import { clientIpHash, boostCountInWindow, BOOST_LIMIT, BOOST_WINDOW_MS } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth";
import { sessionClaims } from "@/lib/session";
import { ALPHA_CLOSED_MESSAGE, ALPHA_LOCK } from "@/lib/alpha-access";

// POST /api/boost - public "Boost this Hearth" (the boost engine): a free support
// signal, not a payment. A signed-in backer boosts in one tap: the identity comes from
// the session cookie (FID, or address for a wallet session), never from the body. Records a ledger backing of kind='boost', qty 1. Public
// (not admin-gated). One boost per backer per Hearth (deduped). Dollar backing
// comes later with the fiat/BYOK payment rails.
// Exact error text the client matches to fall back to the email-or-handle input.
const BACKER_REQUIRED = "backer required (sign in, or give an email or handle)";

export async function POST(req: NextRequest) {
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

    let backerId: string;
    if (claims?.fid) {
      // The session FID is the identity and the dedupe key. fc_username is stored in
      // metadata as an unverified display hint only.
      backerId = `fid:${claims.fid}`;
    } else if (claims?.address) {
      backerId = claims.address;
    } else if (parsed.data.backer?.trim()) {
      backerId = parsed.data.backer.trim().toLowerCase();
    } else {
      return badRequest(BACKER_REQUIRED);
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

    // Dedupe: one boost per backer per Hearth.
    const { data: existing } = await supabase
      .from("hearth_backers")
      .select("id")
      .eq("hearth_id", parsed.data.hearth_id)
      .eq("backer_id", backerId)
      .eq("kind", "boost")
      .maybeSingle();
    if (existing) return ok({ boosted: true, deduped: true }, 200);

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
    if (error) throw error;

    return ok({ boosted: true }, 201);
  } catch (err) {
    return serverError(err, "boost.POST");
  }
}

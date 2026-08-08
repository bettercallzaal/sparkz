import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { boostSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, tooManyRequests } from "@/lib/http";
import { clientIpHash, boostCountInWindow, BOOST_LIMIT, BOOST_WINDOW_MS } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth";

// POST /api/boost - public "Boost this Hearth" (the boost engine): a free support
// signal, not a payment. Records a ledger backing of kind='boost', qty 1. Public
// (not admin-gated). One boost per backer per Hearth (deduped). Dollar backing
// comes later with the fiat/BYOK payment rails.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = boostSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const backerId = parsed.data.backer.trim().toLowerCase();
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
      metadata: { pledge: true, ip_hash: ipHash },
    });
    if (error) throw error;

    return ok({ boosted: true }, 201);
  } catch (err) {
    return serverError(err, "boost.POST");
  }
}

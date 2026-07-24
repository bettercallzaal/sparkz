import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { boostSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, tooManyRequests } from "@/lib/http";
import { clientIpHash, boostCountInWindow, BOOST_LIMIT, BOOST_WINDOW_MS } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth";

// POST /api/boost - public "Boost this Capsule" (the boost engine): a free support
// signal, not a payment. Records a ledger backing of kind='boost', qty 1. Public
// (not admin-gated). One boost per backer per Capsule (deduped). Dollar backing
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

    // Capsule must exist.
    const { data: capsule, error: capErr } = await supabase
      .from("capsules")
      .select("id")
      .eq("id", parsed.data.capsule_id)
      .maybeSingle();
    if (capErr) throw capErr;
    if (!capsule) return badRequest("capsule not found");

    // Dedupe: one boost per backer per Capsule.
    const { data: existing } = await supabase
      .from("capsule_backers")
      .select("id")
      .eq("capsule_id", parsed.data.capsule_id)
      .eq("backer_id", backerId)
      .eq("kind", "boost")
      .maybeSingle();
    if (existing) return ok({ boosted: true, deduped: true }, 200);

    const { error } = await supabase.from("capsule_backers").insert({
      capsule_id: parsed.data.capsule_id,
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

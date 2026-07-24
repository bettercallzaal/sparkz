import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/http";

// Public-safe columns of a Meme Receipt. This is a public endpoint, so it must not
// `select("*")`: MemeReceipt also carries internal fields - `approver` (operator
// identity), `creator`, `lessons`, `rewards`, `signal_id`, `chosen_draft_id` - that
// are not for public consumption. The moat trail (content + reach metrics) is; the
// operational internals are not.
const PUBLIC_RECEIPT_COLUMNS =
  "id, capsule_id, why_it_matched, source_assets, parent_meme_id, versions, remixes, " +
  "contributors, reach, referrals, backing_generated, published_at, created_at";

// GET /api/receipts?capsule_id=... - the Meme Receipt trail for a capsule (the moat).
export async function GET(req: NextRequest) {
  try {
    const capsuleId = req.nextUrl.searchParams.get("capsule_id");
    if (!capsuleId) return badRequest("capsule_id is required");

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("meme_receipts")
      .select(PUBLIC_RECEIPT_COLUMNS)
      .eq("capsule_id", capsuleId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data);
  } catch (err) {
    return serverError(err, "receipts.GET");
  }
}

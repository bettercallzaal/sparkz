import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/http";

// GET /api/receipts?capsule_id=... - the Meme Receipt trail for a capsule (the moat).
export async function GET(req: NextRequest) {
  try {
    const capsuleId = req.nextUrl.searchParams.get("capsule_id");
    if (!capsuleId) return badRequest("capsule_id is required");

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("meme_receipts")
      .select("*")
      .eq("capsule_id", capsuleId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data);
  } catch (err) {
    return serverError(err, "receipts.GET");
  }
}

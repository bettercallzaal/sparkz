import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import type { Capsule } from "@/lib/supabase/types";

// POST /api/capsules/approve - operator approves (or rejects) a pending self-serve
// spark, moving it into (or out of) the public listings. Admin only.
// Body: { id: string, decision?: "approve" | "reject" } (defaults to approve).
export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = (await req.json().catch(() => null)) as
      | { id?: string; decision?: string }
      | null;
    const id = body?.id;
    if (!id) return badRequest("id is required");
    const decision = body?.decision === "reject" ? "rejected" : "approved";

    const supabase = getServiceClient();
    const { data: row, error: getErr } = await supabase
      .from("capsules")
      .select("id, metadata")
      .eq("id", id)
      .maybeSingle();
    if (getErr) throw getErr;
    if (!row) return badRequest("capsule not found");

    const meta = ((row as Capsule).metadata ?? {}) as Record<string, unknown>;
    const { error: updErr } = await supabase
      .from("capsules")
      .update({ metadata: { ...meta, review: decision } })
      .eq("id", id);
    if (updErr) throw updErr;

    return ok({ id, review: decision });
  } catch (err) {
    return serverError(err, "capsules.approve.POST");
  }
}

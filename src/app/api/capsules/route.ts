import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { createCapsuleSchema } from "@/lib/validation/schemas";
import { ok, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { publicCapsule, PUBLIC_REVIEW_FILTER } from "@/lib/sanitize";
import type { Capsule } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  try {
    const wantPending = new URL(req.url).searchParams.get("review") === "pending";
    const supabase = getServiceClient();
    let query = supabase
      .from("capsules")
      .select("*")
      .order("created_at", { ascending: false });

    if (wantPending) {
      // The operator's review queue - admin only. Full rows (incl owner_email).
      const denied = requireAdmin(req);
      if (denied) return denied;
      query = query.filter("metadata->>review", "eq", "pending");
      const { data, error } = await query;
      if (error) throw error;
      return ok(data);
    }

    // Public list: only unreviewed + approved (hides pending AND rejected), and
    // strip PII from metadata before it leaves the server.
    query = query.or(PUBLIC_REVIEW_FILTER);
    const { data, error } = await query;
    if (error) throw error;
    return ok(((data as Capsule[]) ?? []).map(publicCapsule));
  } catch (err) {
    return serverError(err, "capsules.GET");
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = createCapsuleSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("capsules")
      .insert({ status: "spark", ...parsed.data })
      .select("*")
      .single();
    if (error) throw error;
    return ok(data, 201);
  } catch (err) {
    return serverError(err, "capsules.POST");
  }
}

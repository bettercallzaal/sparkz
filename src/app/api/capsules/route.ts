import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { createCapsuleSchema } from "@/lib/validation/schemas";
import { ok, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("capsules")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data);
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

import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { linkEmpireSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { resolveEmpire } from "@/lib/empire/client";
import type { Hearth } from "@/lib/supabase/types";

// POST /api/capsules/link-empire - attach an existing Empire Builder tokenless
// empire to a Hearth. Resolves the Empire ID to its SmartVault treasury and
// records it in economic_config. Admin-gated.
export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = linkEmpireSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const resolved = await resolveEmpire(parsed.data.empire_id);
    if (!resolved) return badRequest("empire not found on Empire Builder");

    const supabase = getServiceClient();
    const { data: hearth, error: capErr } = await supabase
      .from("hearths")
      .select("*")
      .eq("id", parsed.data.hearth_id)
      .maybeSingle();
    if (capErr) throw capErr;
    if (!hearth) return badRequest("hearth not found");

    const econ = (hearth as Hearth).economic_config ?? {};
    const { data, error } = await supabase
      .from("hearths")
      .update({
        economic_config: {
          ...econ,
          empire: true,
          tokenization_rail: "empire",
          empire_id: resolved.empireId,
          empire_address: resolved.empireAddress,
          empire_token_type: resolved.tokenType,
        },
      })
      .eq("id", parsed.data.hearth_id)
      .select("*")
      .single();
    if (error) throw error;

    return ok({
      hearth: data as Hearth,
      empire: {
        empire_id: resolved.empireId,
        empire_address: resolved.empireAddress,
        token_type: resolved.tokenType,
      },
    });
  } catch (err) {
    return serverError(err, "hearths.linkEmpire.POST");
  }
}

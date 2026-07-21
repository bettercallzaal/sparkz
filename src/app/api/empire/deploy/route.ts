import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { deployEmpireSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { deployTokenlessCustom, resolveEmpire } from "@/lib/empire/client";
import type { Capsule } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = deployEmpireSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { data: capsule, error: capErr } = await supabase
      .from("capsules").select("*").eq("id", parsed.data.capsule_id).maybeSingle();
    if (capErr) throw capErr;
    if (!capsule) return badRequest("capsule not found");

    const { baseToken } = await deployTokenlessCustom({
      owner: parsed.data.owner,
      name: parsed.data.name,
      signature: parsed.data.signature as `0x${string}`,
    });
    const resolved = baseToken ? await resolveEmpire(baseToken) : null;

    const econ = (capsule as Capsule).economic_config ?? {};
    const { data, error } = await supabase.from("capsules").update({
      economic_config: {
        ...econ, empire: true, tokenization_rail: "empire",
        empire_id: baseToken,
        empire_address: resolved?.empireAddress ?? null,
        empire_mode: "custom", empire_owner: parsed.data.owner,
      },
    }).eq("id", parsed.data.capsule_id).select("*").single();
    if (error) throw error;

    return ok({ empire_id: baseToken, empire_address: resolved?.empireAddress ?? null, capsule: data }, 201);
  } catch (err) {
    return serverError(err, "empire.deploy.POST");
  }
}

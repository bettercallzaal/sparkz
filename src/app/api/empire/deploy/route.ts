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

    // Empire is an external upstream; surface its real error to the operator
    // (this is a gated operator tool, not a public endpoint).
    let baseToken: string;
    try {
      ({ baseToken } = await deployTokenlessCustom({
        owner: parsed.data.owner,
        name: parsed.data.name,
        signature: parsed.data.signature as `0x${string}`,
        logoUri: parsed.data.logo_uri,
        bio: parsed.data.bio,
        website_url: parsed.data.website_url,
        twitter_url: parsed.data.twitter_url,
        telegram_url: parsed.data.telegram_url,
      }));
    } catch (empireErr) {
      const msg =
        empireErr instanceof Error ? empireErr.message : "empire deploy failed";
      console.error("[sparkz:empire.deploy] upstream:", msg);
      return badRequest(msg);
    }
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

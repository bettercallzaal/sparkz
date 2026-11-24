import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { empireRegisterTokenSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { isAdmin, requireHearthOwner } from "@/lib/auth";
import { registerTokenEmpire } from "@/lib/empire/client";
import { tokenLaunchRefusal } from "@/lib/empire/deploy-guard";
import type { Hearth } from "@/lib/supabase/types";

// Step 3 of a token launch: the owner's wallet has deployed the Clanker token (step 2,
// in the browser). Empire checks that tx and creates the token's empire treasury; the
// Hearth records it and graduates to "tokenized".
export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    const body = await req.json().catch(() => null);
    const parsed = empireRegisterTokenSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const denied = await requireHearthOwner(req, parsed.data.hearth_id);
    if (denied) return denied;

    const supabase = getServiceClient();
    const { data: hearth, error: hErr } = await supabase
      .from("hearths").select("*").eq("id", parsed.data.hearth_id).maybeSingle();
    if (hErr) throw hErr;
    if (!hearth) return badRequest("hearth not found");

    const operator = isAdmin(req);
    const refusal = tokenLaunchRefusal(hearth as Hearth, operator);
    if (refusal) {
      return NextResponse.json({ ok: false, error: refusal.error }, { status: refusal.status });
    }

    // Single-launch claim, so two calls cannot both register a token. A tokenless empire
    // may already be linked (graduation), so the claim keys on the token, not the empire.
    const econBefore = ((hearth as Hearth).economic_config ?? {}) as Record<string, unknown>;
    if (!operator) {
      const { data: claimed, error: claimErr } = await supabase
        .from("hearths")
        .update({ economic_config: { ...econBefore, token_launch_claimed_at: new Date().toISOString() } })
        .eq("id", parsed.data.hearth_id)
        .is("economic_config->>token_address", null)
        .is("economic_config->>token_launch_claimed_at", null)
        .select("id");
      if (claimErr) throw claimErr;
      if (!claimed || claimed.length === 0) {
        return NextResponse.json(
          { ok: false, error: "A token launch for this Hearth is already in progress or done" },
          { status: 409 },
        );
      }
    }

    const d = parsed.data;
    let empireAddress: string | null;
    try {
      ({ empireAddress } = await registerTokenEmpire({
        baseToken: d.base_token,
        name: d.name,
        owner: d.owner,
        txHash: d.tx_hash,
        symbol: d.symbol,
        logoUri: d.logo_uri,
        bio: d.bio,
        website_url: d.website_url,
        twitter_url: d.twitter_url,
        warpcast_url: d.farcaster_url,
        telegram_url: d.telegram_url,
      }));
    } catch (empireErr) {
      const msg = empireErr instanceof Error ? empireErr.message : "empire register failed";
      console.error("[sparkz:empire.register-token] upstream:", msg);
      if (!operator) {
        await supabase.from("hearths").update({ economic_config: econBefore }).eq("id", d.hearth_id);
      }
      return badRequest(msg);
    }

    const { data, error } = await supabase.from("hearths").update({
      status: "tokenized",
      economic_config: {
        ...econBefore, empire: true, tokenization_rail: "empire", graduated: true,
        empire_id: d.base_token, empire_address: empireAddress,
        empire_mode: "token", empire_owner: d.owner, empire_token_type: "clanker",
        previous_empire_id: econBefore.empire_id ?? null, previous_empire_address: econBefore.empire_address ?? null,
        token_address: d.base_token, token_symbol: d.symbol, deploy_tx: d.tx_hash,
      },
    }).eq("id", d.hearth_id).select("*").single();
    if (error) throw error;

    return ok({ empire_id: d.base_token, empire_address: empireAddress, hearth: data }, 201);
  } catch (err) {
    return serverError(err, "empire.register-token.POST");
  }
}

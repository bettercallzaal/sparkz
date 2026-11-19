import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { deployEmpireSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { isAdmin, requireHearthOwner } from "@/lib/auth";
import { deployTokenlessCustom, resolveEmpire } from "@/lib/empire/client";
import { ownerDeployRefusal } from "@/lib/empire/deploy-guard";
import type { Hearth } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    const body = await req.json().catch(() => null);
    const parsed = deployEmpireSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    // Owner-or-operator: the Hearth's owner (verified session FID) may deploy its own
    // empire; the deploy itself is still signed by the owner wallet (EIP-191).
    const denied = await requireHearthOwner(req, parsed.data.hearth_id);
    if (denied) return denied;

    const supabase = getServiceClient();
    const { data: hearth, error: capErr } = await supabase
      .from("hearths").select("*").eq("id", parsed.data.hearth_id).maybeSingle();
    if (capErr) throw capErr;
    if (!hearth) return badRequest("hearth not found");

    // Owners: one deploy per Hearth, reviewed Hearths only (lib/empire/deploy-guard.ts).
    const refusal = ownerDeployRefusal(hearth as Hearth, isAdmin(req));
    if (refusal) {
      return NextResponse.json({ ok: false, error: refusal.error }, { status: refusal.status });
    }

    // Owners: claim the Hearth's single deploy atomically, so two concurrent calls
    // cannot both pass the check above and both spend the operator key. The
    // conditional update matches only while no empire and no claim are recorded.
    const operator = isAdmin(req);
    const econBefore = ((hearth as Hearth).economic_config ?? {}) as Record<string, unknown>;
    if (!operator) {
      const { data: claimed, error: claimErr } = await supabase
        .from("hearths")
        .update({
          economic_config: { ...econBefore, empire_deploy_claimed_at: new Date().toISOString() },
        })
        .eq("id", parsed.data.hearth_id)
        .is("economic_config->>empire_id", null)
        .is("economic_config->>empire_deploy_claimed_at", null)
        .select("id");
      if (claimErr) throw claimErr;
      if (!claimed || claimed.length === 0) {
        return NextResponse.json(
          { ok: false, error: "A deploy for this Hearth is already in progress or done" },
          { status: 409 },
        );
      }
    }

    // Empire is an external upstream; surface its real error to the operator
    // (this is an owner/operator-gated tool, not a public endpoint).
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
      // Nothing was deployed: release the owner's claim so they can retry.
      if (!operator) {
        const { error: releaseErr } = await supabase
          .from("hearths")
          .update({ economic_config: econBefore })
          .eq("id", parsed.data.hearth_id);
        if (releaseErr) {
          // The claim stays set, so a retry answers 409. Say which Hearth, so an operator can clear it.
          console.error("[sparkz:empire.deploy] claim release failed for hearth", parsed.data.hearth_id, releaseErr);
        }
      }
      return badRequest(msg);
    }
    // The empire now exists on Base. Log its id before anything else can fail, so it is
    // never lost if the record update below does not land.
    console.error("[sparkz:empire.deploy] deployed", { hearth_id: parsed.data.hearth_id, empire_id: baseToken });
    // Resolving the address is a nice-to-have: a failure here must not lose the deploy.
    let resolved: Awaited<ReturnType<typeof resolveEmpire>> | null = null;
    if (baseToken) {
      try {
        resolved = await resolveEmpire(baseToken);
      } catch (resolveErr) {
        console.error("[sparkz:empire.deploy] resolve failed, saving the id without an address:", resolveErr);
      }
    }

    const { data, error } = await supabase.from("hearths").update({
      economic_config: {
        ...econBefore, empire: true, tokenization_rail: "empire",
        empire_id: baseToken,
        empire_address: resolved?.empireAddress ?? null,
        empire_mode: "custom", empire_owner: parsed.data.owner,
      },
    }).eq("id", parsed.data.hearth_id).select("*").single();
    if (error) {
      // The deploy happened, so hand back its id rather than a bare 500: the owner can attach
      // it with "Link an existing Empire" (capsules/link-empire).
      console.error("[sparkz:empire.deploy] saving the deployed empire failed", { hearth_id: parsed.data.hearth_id, empire_id: baseToken }, error);
      return NextResponse.json(
        {
          ok: false,
          empire_id: baseToken,
          error: `Your Empire was deployed (id ${baseToken}) but saving it to this Hearth failed. Link it with that id.`,
        },
        { status: 500 },
      );
    }

    return ok({ empire_id: baseToken, empire_address: resolved?.empireAddress ?? null, hearth: data }, 201);
  } catch (err) {
    return serverError(err, "empire.deploy.POST");
  }
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { empireRegisterTokenSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { pendingDeployTx, tokenLaunchRefusal } from "@/lib/empire/deploy-guard";
import { deployTxProblem } from "@/lib/empire/verify-deploy";
import { launchDeps as deps } from "@/lib/empire/launch-deps";
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

    const denied = await deps.requireHearthOwner(req, parsed.data.hearth_id);
    if (denied) return denied;

    const supabase = deps.getServiceClient();
    const { data: hearth, error: hErr } = await supabase
      .from("hearths").select("*").eq("id", parsed.data.hearth_id).maybeSingle();
    if (hErr) throw hErr;
    if (!hearth) return badRequest("hearth not found");

    const refusal = tokenLaunchRefusal(hearth as Hearth, deps.isAdmin(req));
    if (refusal) {
      return NextResponse.json({ ok: false, error: refusal.error }, { status: refusal.status });
    }

    const d = parsed.data;
    const econBefore = ((hearth as Hearth).economic_config ?? {}) as Record<string, unknown>;

    // Only the launch this Hearth recorded in token-pending. No recorded tx means nothing
    // to register, so it is refused rather than skipped (post-merge review of #430).
    const pending = pendingDeployTx(hearth as Hearth);
    if (!pending) {
      return NextResponse.json(
        { ok: false, error: "No launch is recorded for this Hearth. Send the launch from the coin page first." },
        { status: 409 },
      );
    }
    if (pending.toLowerCase() !== d.tx_hash.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "That is not the launch recorded for this Hearth" }, { status: 409 });
    }
    // The wallet named here must be the one that took the launch lock in token-config
    // (round 3, item 1). No lock means no prepared launch, so nothing to register; this
    // ties the recorded empire_owner to the wallet the signed-in owner prepared with.
    const lockBy = typeof econBefore.token_launch_lock_by === "string" ? econBefore.token_launch_lock_by : null;
    if (!lockBy) {
      return NextResponse.json({ ok: false, error: "This launch was never prepared. Start it again from the coin page." }, { status: 409 });
    }
    if (lockBy.toLowerCase() !== d.owner.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "That wallet did not prepare this launch" }, { status: 409 });
    }

    // Read the tx on Base here instead of trusting the browser (round 2, item 4). tx.from must
    // be the wallet that holds the launch lock (the wallet recorded for this launch; the
    // pending tx itself stores only the hash), not the browser's word for it.
    const problem = deployTxProblem(await deps.readDeployTx(d.tx_hash), { owner: lockBy, baseToken: d.base_token });
    if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 409 });

    // Single-launch claim for everyone, operator included (round 2, item 3), so two calls
    // cannot both register a token. Keys on the token, not the empire (graduation).
    {
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

    let empireAddress: string | null;
    try {
      ({ empireAddress } = await deps.registerTokenEmpire({
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
      // Empire's own error text stays in the server log (round 2, item 5).
      console.error("[sparkz:empire.register-token] upstream:", empireErr instanceof Error ? empireErr.message : empireErr);
      await supabase.from("hearths").update({ economic_config: econBefore }).eq("id", d.hearth_id);
      return NextResponse.json(
        { ok: false, error: "Empire could not register the coin yet. The coin is on Base; press Finish launch to try again." },
        { status: 502 },
      );
    }

    const { data, error } = await supabase.from("hearths").update({
      status: "tokenized",
      economic_config: {
        ...econBefore, empire: true, tokenization_rail: "empire", graduated: true,
        empire_id: d.base_token, empire_address: empireAddress,
        empire_mode: "token", empire_owner: d.owner, empire_token_type: "clanker",
        previous_empire_id: econBefore.empire_id ?? null, previous_empire_address: econBefore.empire_address ?? null,
        token_address: d.base_token, token_symbol: d.symbol, deploy_tx: d.tx_hash, pending_deploy_tx: null,
      },
    }).eq("id", d.hearth_id).select("*").single();
    if (error) {
      // Empire has registered the coin but the Hearth did not save it. The one-launch claim
      // stays, so Finish launch cannot ask Empire a second time; the operator records it by
      // hand from this log line (the FEF recovery run sheet, ORD-713).
      console.error(
        "[sparkz:empire.register-token] REGISTERED BUT NOT SAVED:",
        JSON.stringify({ hearth_id: d.hearth_id, token: d.base_token, tx: d.tx_hash, owner: d.owner, empire_address: empireAddress }),
        error.message,
      );
      return NextResponse.json(
        {
          ok: false,
          error: "Empire registered the coin but Sparkz could not save it. Do not launch again; the operator will record it.",
        },
        { status: 500 },
      );
    }

    return ok({ empire_id: d.base_token, empire_address: empireAddress, hearth: data }, 201);
  } catch (err) {
    return serverError(err, "empire.register-token.POST");
  }
}

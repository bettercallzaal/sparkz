import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { empireTokenConfigSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { launchLockRefusal, pendingDeployTx, tokenLaunchRefusal } from "@/lib/empire/deploy-guard";
import { tokenConfigRefusals } from "@/lib/empire/launch-summary";
import { launchDeps as deps } from "@/lib/empire/launch-deps";
import type { Hearth } from "@/lib/supabase/types";

// Step 1 of a token launch (graduation): Empire builds the Clanker v4 tokenConfig with
// the operator's EMPIRE_API_KEY, which never leaves the server. The owner's wallet then
// deploys it in the browser and calls /api/empire/register-token with the tx hash.
// Nothing goes on-chain here.
export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    const body = await req.json().catch(() => null);
    const parsed = empireTokenConfigSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const denied = await deps.requireHearthOwner(req, parsed.data.hearth_id);
    if (denied) return denied;

    const supabase = deps.getServiceClient();
    const { data: hearth, error } = await supabase
      .from("hearths").select("*").eq("id", parsed.data.hearth_id).maybeSingle();
    if (error) throw error;
    if (!hearth) return badRequest("hearth not found");

    const refusal = tokenLaunchRefusal(hearth as Hearth, deps.isAdmin(req));
    if (refusal) {
      return NextResponse.json({ ok: false, error: refusal.error }, { status: refusal.status });
    }

    // A deploy was already sent for this Hearth: never hand out a second config.
    const pending = pendingDeployTx(hearth as Hearth);
    if (pending) {
      return NextResponse.json(
        { ok: false, error: "A launch was already sent for this Hearth. Finish it instead of launching again.", pending_tx: pending },
        { status: 409 },
      );
    }

    // One-launch lock, taken now, before any wallet can send (round 2, item 3).
    const d = parsed.data;
    const wallet = d.creator.toLowerCase();
    const now = deps.now();
    const locked = launchLockRefusal(hearth as Hearth, wallet, now);
    if (locked) return NextResponse.json({ ok: false, error: locked.error }, { status: locked.status });
    const econ = ((hearth as Hearth).economic_config ?? {}) as Record<string, unknown>;
    const lockAt = new Date(now).toISOString();
    const prevAt = typeof econ.token_launch_lock_at === "string" ? econ.token_launch_lock_at : null;
    let claim = supabase
      .from("hearths")
      .update({
        economic_config: { ...econ, token_launch_lock_at: lockAt, token_launch_lock_by: wallet },
      })
      .eq("id", d.hearth_id)
      .is("economic_config->>pending_deploy_tx", null);
    // Compare-and-set on the lock we read, so two requests cannot both take it.
    claim = prevAt ? claim.eq("economic_config->>token_launch_lock_at", prevAt) : claim.is("economic_config->>token_launch_lock_at", null);
    const { data: claimed, error: claimErr } = await claim.select("id");
    if (claimErr) throw claimErr;
    if (!claimed || claimed.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Another launch is being prepared for this Hearth. Try again in a minute." },
        { status: 409 },
      );
    }

    // Empire failed or its config was refused: nothing was handed out, so give the lock back
    // (compare-and-set on the lock we just took) and a retry is not blocked for 10 minutes.
    const releaseLock = async () => {
      const rest = { ...econ };
      delete rest.token_launch_lock_at;
      delete rest.token_launch_lock_by;
      const { error: relErr } = await supabase
        .from("hearths")
        .update({ economic_config: rest })
        .eq("id", d.hearth_id)
        .eq("economic_config->>token_launch_lock_at", lockAt)
        .is("economic_config->>pending_deploy_tx", null)
        .select("id");
      if (relErr) console.error("[sparkz:empire.token-config] lock release failed:", relErr.message);
    };

    let tokenConfig: unknown;
    try {
      ({ tokenConfig } = await deps.getTokenConfig({
        name: d.name,
        symbol: d.symbol,
        imageUrl: d.image_url,
        creatorAddress: d.creator,
        vaultPercentage: d.vault_percentage,
        vaultDays: d.vault_days,
        feeType: "dynamic",
        enableSniperFees: true,
        tokenDescription: d.description,
        socialTwitter: d.twitter_url,
        socialFarcaster: d.farcaster_url,
        socialWebsite: d.website_url,
        socialTelegram: d.telegram_url,
      }));
    } catch (empireErr) {
      // Empire's own error text stays in the server log (round 2, item 5).
      console.error("[sparkz:empire.token-config] upstream:", empireErr instanceof Error ? empireErr.message : empireErr);
      await releaseLock();
      return NextResponse.json(
        { ok: false, error: "Empire could not build the launch right now. Nothing was sent. Try again in a minute." },
        { status: 502 },
      );
    }

    // Check Empire's answer here, not only in the browser (round 2, item 2): shape, no dev
    // buy, no airdrop, shares that add up, only you and Empire's own wallet paid.
    const problems = tokenConfigRefusals(tokenConfig, d.creator);
    if (problems.length > 0) {
      console.error("[sparkz:empire.token-config] refused config:", problems);
      await releaseLock();
      return NextResponse.json(
        { ok: false, error: `Sparkz refused Empire's launch config: ${problems.join("; ")}` },
        { status: 502 },
      );
    }
    return ok({ tokenConfig });
  } catch (err) {
    return serverError(err, "empire.token-config.POST");
  }
}

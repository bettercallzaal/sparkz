import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { empireTokenConfigSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { isAdmin, requireHearthOwner } from "@/lib/auth";
import { getTokenConfig } from "@/lib/empire/client";
import { pendingDeployTx, tokenLaunchRefusal } from "@/lib/empire/deploy-guard";
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

    const denied = await requireHearthOwner(req, parsed.data.hearth_id);
    if (denied) return denied;

    const supabase = getServiceClient();
    const { data: hearth, error } = await supabase
      .from("hearths").select("*").eq("id", parsed.data.hearth_id).maybeSingle();
    if (error) throw error;
    if (!hearth) return badRequest("hearth not found");

    const refusal = tokenLaunchRefusal(hearth as Hearth, isAdmin(req));
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

    const d = parsed.data;
    try {
      const { tokenConfig } = await getTokenConfig({
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
      });
      return ok({ tokenConfig });
    } catch (empireErr) {
      const msg = empireErr instanceof Error ? empireErr.message : "token config failed";
      console.error("[sparkz:empire.token-config] upstream:", msg);
      return badRequest(msg);
    }
  } catch (err) {
    return serverError(err, "empire.token-config.POST");
  }
}

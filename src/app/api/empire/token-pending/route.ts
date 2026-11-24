import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { isAdmin, requireHearthOwner } from "@/lib/auth";
import { pendingDeployTx, tokenLaunchRefusal } from "@/lib/empire/deploy-guard";
import type { Hearth } from "@/lib/supabase/types";

// Step 2b of a token launch: the owner's wallet has just SENT the deploy tx. Record its hash
// on the Hearth before waiting for Base, so a closed tab, a failed register or a retry
// resumes this one coin instead of deploying a second. Nothing goes on-chain here.
const schema = z.object({
  hearth_id: z.string().uuid(),
  tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
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

    const pending = pendingDeployTx(hearth as Hearth);
    if (pending === parsed.data.tx_hash) return ok({ pending_tx: pending });
    if (pending) {
      return NextResponse.json(
        { ok: false, error: "Another launch is already pending for this Hearth", pending_tx: pending },
        { status: 409 },
      );
    }

    const econ = ((hearth as Hearth).economic_config ?? {}) as Record<string, unknown>;
    const { data: saved, error: upErr } = await supabase
      .from("hearths")
      .update({ economic_config: { ...econ, pending_deploy_tx: parsed.data.tx_hash } })
      .eq("id", parsed.data.hearth_id)
      .is("economic_config->>pending_deploy_tx", null)
      .select("id");
    if (upErr) throw upErr;
    if (!saved || saved.length === 0) {
      return NextResponse.json({ ok: false, error: "Another launch is already pending for this Hearth" }, { status: 409 });
    }
    return ok({ pending_tx: parsed.data.tx_hash });
  } catch (err) {
    return serverError(err, "empire.token-pending.POST");
  }
}

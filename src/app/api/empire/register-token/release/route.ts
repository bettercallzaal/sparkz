import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ok, badRequest, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { launchDeps as deps } from "@/lib/empire/launch-deps";

// POST /api/empire/register-token/release - operator only. Frees a stuck one-launch claim
// (economic_config.token_launch_claimed_at) on a Hearth whose coin is not recorded yet, so
// Finish launch can run again (ORD-713, H1). It never records a token and never calls
// Empire: the recorded launch (pending_deploy_tx) and the launch lock stay as they are, so
// the retry finishes the same coin and no second coin can be prepared. A Hearth that
// already has its token is refused.
const bodySchema = z.object({ hearth_id: z.string().uuid() }).strict();

export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;
    if (!deps.isAdmin(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return zodError(parsed.error);

    const supabase = deps.getServiceClient();
    const { data: hearth, error: hErr } = await supabase
      .from("hearths").select("*").eq("id", parsed.data.hearth_id).maybeSingle();
    if (hErr) throw hErr;
    if (!hearth) return badRequest("hearth not found");

    const econ = ((hearth as { economic_config?: unknown }).economic_config ?? {}) as Record<string, unknown>;
    if (econ.token_address) {
      return NextResponse.json({ ok: false, error: "This Hearth already has its coin recorded" }, { status: 409 });
    }
    if (typeof econ.token_launch_claimed_at !== "string") {
      return NextResponse.json({ ok: false, error: "No launch is stuck on this Hearth" }, { status: 409 });
    }

    const rest = { ...econ };
    delete rest.token_launch_claimed_at;
    const { data: released, error } = await supabase
      .from("hearths")
      .update({ economic_config: rest })
      .eq("id", parsed.data.hearth_id)
      .is("economic_config->>token_address", null)
      .eq("economic_config->>token_launch_claimed_at", econ.token_launch_claimed_at)
      .select("id");
    if (error) throw error;
    if (!released || released.length === 0) {
      return NextResponse.json({ ok: false, error: "The launch changed while releasing it. Reload and check." }, { status: 409 });
    }
    return ok({ released: true, pending_tx: econ.pending_deploy_tx ?? null });
  } catch (err) {
    return serverError(err, "empire.register-token.release.POST");
  }
}

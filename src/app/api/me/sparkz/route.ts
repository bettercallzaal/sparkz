import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/http";
import { assembleMySparkz } from "@/lib/my-sparkz";
import { SIGN_IN_MY_SPARKZ, meIdentity, ownedHearths, publicHearthsById } from "../owned";

export const dynamic = "force-dynamic";

// GET /api/me/sparkz - the My Sparkz tab (Zaal, 25 Nov 2026: "the sparkz someone owns in
// what hearth they lie in"): the Sparks the signed-in person started or holds, each with
// the Hearth it lives in. Sources and rules are in lib/my-sparkz.ts. Signed out is a 401
// with a plain message; the page shows a sign-in prompt.
export async function GET(req: NextRequest) {
  try {
    const me = meIdentity(req);
    if (!me) return NextResponse.json({ ok: false, error: SIGN_IN_MY_SPARKZ }, { status: 401 });

    const supabase = getServiceClient();
    const owned = await ownedHearths(me);
    const ownedIds = owned.map((h) => h.id);

    type SparkRow = { id: string; hearth_id: string; kind: string; title: string; status?: string; created_at: string };
    let sparks: SparkRow[] = [];
    if (me.fid) {
      const { data, error } = await supabase
        .from("sparks")
        .select("id, hearth_id, kind, title, status, created_at")
        .eq("created_by_fid", me.fid)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      sparks = (data as SparkRow[]) ?? [];
    }

    type BountyRow = { id: string; hearth_id: string; bounty_id: string | number; created_at: string };
    let bounties: BountyRow[] = [];
    if (ownedIds.length > 0) {
      const { data, error } = await supabase
        .from("hearth_bounties")
        .select("id, hearth_id, bounty_id, created_at")
        .in("hearth_id", ownedIds)
        .limit(200);
      if (error) throw error;
      bounties = (data as BountyRow[]) ?? [];
    }

    const { data: boostRows, error: bErr } = await supabase
      .from("hearth_backers")
      .select("hearth_id, created_at")
      .eq("backer_id", me.backerId)
      .eq("kind", "boost")
      .limit(200);
    if (bErr) throw bErr;
    const boosts = (boostRows as { hearth_id: string; created_at: string }[]) ?? [];

    const own = new Set(ownedIds);
    const others = await publicHearthsById(
      [...sparks, ...boosts].map((r) => r.hearth_id).filter((id) => !own.has(id)),
    );

    return ok(assembleMySparkz({ owned, sparks, bounties, boosts, hearths: others }));
  } catch (err) {
    return serverError(err, "me.sparkz.GET");
  }
}

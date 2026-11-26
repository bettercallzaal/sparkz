import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/http";
import { assembleMyHearths } from "@/lib/my-sparkz";
import { SIGN_IN_MY_HEARTHS, meIdentity, ownedHearths, publicHearthsById } from "../owned";

export const dynamic = "force-dynamic";

// GET /api/me/hearths - the My Hearths tab: Hearths the signed-in person owns or
// contributes to (a boost, backing or collectable they gave; a team sign-up with their
// wallet). Signed out is a 401 with a plain message; the page shows a sign-in prompt.
// team_signups has no fid column, so team rows match a wallet session only.
export async function GET(req: NextRequest) {
  try {
    const me = meIdentity(req);
    if (!me) return NextResponse.json({ ok: false, error: SIGN_IN_MY_HEARTHS }, { status: 401 });

    const supabase = getServiceClient();
    const owned = await ownedHearths(me);

    const { data: backings, error: bErr } = await supabase
      .from("hearth_backers")
      .select("hearth_id, created_at")
      .eq("backer_id", me.backerId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (bErr) throw bErr;

    let team: { hearth_id: string; created_at: string }[] = [];
    if (me.address) {
      const { data, error } = await supabase
        .from("team_signups")
        .select("hearth_id, created_at")
        .eq("wallet", me.address)
        .limit(200);
      if (error) throw error;
      team = (data as typeof team) ?? [];
    }

    const backed = (backings as { hearth_id: string; created_at: string }[]) ?? [];
    const ownedIds = new Set(owned.map((h) => h.id));
    const others = await publicHearthsById(
      [...backed, ...team].map((r) => r.hearth_id).filter((id) => !ownedIds.has(id)),
    );

    return ok(assembleMyHearths({ owned, backings: backed, team, hearths: others }));
  } catch (err) {
    return serverError(err, "me.hearths.GET");
  }
}

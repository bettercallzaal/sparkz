import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/http";
import { sessionFid } from "@/lib/session";
import { PUBLIC_REVIEW_FILTER } from "@/lib/sanitize";
import { groupBackings, type BackingRow } from "@/lib/my-backings";

export const dynamic = "force-dynamic";

// GET /api/me/backings - the Hearths the signed-in FID has boosted or backed, one
// entry per Hearth, newest first, for "Hearths you back" on Home. Pattern credit:
// Kickstarter's "Backed projects", Patreon's "Memberships".
//
// The FID comes from the verified session only (gated before any database call). A
// signed-in backing is stored as backer_id "fid:<n>" (/api/boost), so that is the only
// key matched. Hearths that are pending or rejected are left out, like every public list.
export async function GET(req: NextRequest) {
  try {
    const fid = sessionFid(req);
    if (!fid) {
      return NextResponse.json({ ok: false, error: "Sign in to see what you back" }, { status: 401 });
    }

    const supabase = getServiceClient();
    const { data: rows, error } = await supabase
      .from("hearth_backers")
      .select("hearth_id, kind, created_at")
      .eq("backer_id", `fid:${fid}`)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;

    const grouped = groupBackings((rows as BackingRow[]) ?? []);
    if (grouped.length === 0) return ok([]);

    const { data: hearths, error: hErr } = await supabase
      .from("hearths")
      .select("id, slug, name, type, status")
      .in("id", grouped.map((g) => g.hearth_id))
      .or(PUBLIC_REVIEW_FILTER);
    if (hErr) throw hErr;
    const byId = new Map(
      ((hearths as { id: string; slug: string; name: string; type: string; status: string }[]) ?? []).map((h) => [h.id, h]),
    );

    return ok(
      grouped
        .map((g) => {
          const h = byId.get(g.hearth_id);
          return h ? { slug: h.slug, name: h.name, type: h.type, status: h.status, kinds: g.kinds, last_at: g.last_at } : null;
        })
        .filter((x) => x !== null),
    );
  } catch (err) {
    return serverError(err, "me.backings.GET");
  }
}

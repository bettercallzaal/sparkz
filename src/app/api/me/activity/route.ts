import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/http";
import { sessionFid } from "@/lib/session";
import { activityLabel } from "@/lib/activity";

export const dynamic = "force-dynamic";

const LIMIT = 30;

// GET /api/me/activity - the newest backings and boosts on the Hearths the signed-in
// FID owns, newest first, for the "New on your Hearths" list on Home. Pattern credit:
// Kickstarter's backings dashboard and Patreon's activity feed (in-app notifications,
// the gap in ZAOresearch doc 2485's client matrix).
//
// Only ever the caller's own Hearths: the FID comes from the verified session cookie,
// never from the request. Backer identities are shown the same way the public Hearth
// page shows them, with one addition for the owner: a Farcaster backer appears as its
// verified FID (lib/activity.ts). Emails and IP hashes never leave the server.
export async function GET(req: NextRequest) {
  try {
    const fid = sessionFid(req);
    if (!fid) {
      return NextResponse.json({ ok: false, error: "Sign in to see your activity" }, { status: 401 });
    }

    const supabase = getServiceClient();
    const { data: hearths, error: hErr } = await supabase
      .from("hearths")
      .select("id, slug, name")
      .eq("owner_fid", fid);
    if (hErr) throw hErr;

    const list = (hearths as { id: string; slug: string; name: string }[]) ?? [];
    if (list.length === 0) return ok([]);
    const byId = new Map(list.map((h) => [h.id, h]));

    const { data: rows, error: bErr } = await supabase
      .from("hearth_backers")
      .select("id, hearth_id, backer_id, kind, created_at")
      .in("hearth_id", list.map((h) => h.id))
      .order("created_at", { ascending: false })
      .limit(LIMIT);
    if (bErr) throw bErr;

    const items = ((rows as { id: string; hearth_id: string; backer_id: string; kind: string; created_at: string }[]) ?? [])
      .map((r) => {
        const h = byId.get(r.hearth_id);
        if (!h) return null;
        return {
          id: r.id,
          hearth: { slug: h.slug, name: h.name },
          kind: r.kind,
          who: activityLabel(r.backer_id),
          at: r.created_at,
        };
      })
      .filter((x) => x !== null);

    return ok(items);
  } catch (err) {
    return serverError(err, "me.activity.GET");
  }
}

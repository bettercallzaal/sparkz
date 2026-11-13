import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/http";
import { requireHearthOwner } from "@/lib/auth";
import { activityLabel } from "@/lib/activity";
import { backerStats, type StatRow } from "@/lib/backer-stats";

export const dynamic = "force-dynamic";

const LIMIT = 200;

// GET /api/capsules/backers-owner?hearth_id=... - the Backers view on a Hearth's
// Manage page: totals plus the newest backers, for the owner or an admin
// (requireHearthOwner, which refuses a missing or cross-site session before reading the
// Hearth). Backers show as on the public page (lib/activity.ts): a signed-in backer as
// their FID, an email as "a supporter", a wallet shortened. Emails and IP hashes never
// leave the server.
export async function GET(req: NextRequest) {
  try {
    const hearthId = req.nextUrl.searchParams.get("hearth_id") ?? "";
    if (!/^[0-9a-f-]{36}$/i.test(hearthId)) return badRequest("hearth_id is required");
    const denied = await requireHearthOwner(req, hearthId);
    if (denied) return denied;

    const { data, error } = await getServiceClient()
      .from("hearth_backers")
      .select("id, backer_id, kind, created_at")
      .eq("hearth_id", hearthId)
      .order("created_at", { ascending: false })
      .limit(LIMIT);
    if (error) throw error;
    const rows = (data as (StatRow & { id: string })[]) ?? [];

    return ok({
      stats: backerStats(rows),
      backers: rows.slice(0, 50).map((r) => ({
        id: r.id,
        who: activityLabel(r.backer_id),
        kind: r.kind,
        at: r.created_at,
      })),
      capped: rows.length === LIMIT,
    });
  } catch (err) {
    return serverError(err, "hearths.backersOwner.GET");
  }
}

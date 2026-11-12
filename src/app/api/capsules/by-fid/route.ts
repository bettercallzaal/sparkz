import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/http";
import { publicHearth } from "@/lib/sanitize";
import type { Hearth } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

// GET /api/capsules/by-fid?fid=123 - Hearths owned by a Farcaster fid, for the
// creator hub's "your sparks" list. Returns the owner's own sparks (including any
// still pending review) but with PII stripped. Read-only; nothing sensitive beyond
// name/slug/status/type is exposed.
export async function GET(req: NextRequest) {
  try {
    const fidParam = req.nextUrl.searchParams.get("fid");
    const fid = fidParam ? Number(fidParam) : NaN;
    if (!Number.isInteger(fid) || fid <= 0) return badRequest("valid fid required");

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("hearths")
      .select("id, slug, name, type, status, bio, metadata, owner_fid, created_at")
      .eq("owner_fid", fid)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const hearths = (data as Hearth[]) ?? [];

    // Per-Hearth counts for the "Mine" home cards: boosts, and distinct backers of any
    // kind. Counts only, no backer identities leave the server.
    const ids = hearths.map((h) => h.id);
    const boosts = new Map<string, number>();
    const backers = new Map<string, Set<string>>();
    if (ids.length > 0) {
      const { data: rowsB, error: errB } = await supabase
        .from("hearth_backers")
        .select("hearth_id, backer_id, kind")
        .in("hearth_id", ids);
      if (errB) throw errB;
      for (const b of (rowsB as { hearth_id: string; backer_id: string; kind: string }[]) ?? []) {
        if (b.kind === "boost") boosts.set(b.hearth_id, (boosts.get(b.hearth_id) ?? 0) + 1);
        if (!backers.has(b.hearth_id)) backers.set(b.hearth_id, new Set());
        backers.get(b.hearth_id)!.add(b.backer_id);
      }
    }

    const rows = hearths.map((c) => {
      const cleaned = publicHearth(c);
      const review = (cleaned.metadata as { review?: string })?.review ?? null;
      return {
        slug: cleaned.slug,
        name: cleaned.name,
        type: cleaned.type,
        status: cleaned.status,
        bio: cleaned.bio,
        review, // 'pending' | 'approved' | null so the UI can badge unlisted ones
        boosts: boosts.get(c.id) ?? 0,
        backers: backers.get(c.id)?.size ?? 0,
      };
    });
    return ok(rows);
  } catch (err) {
    return serverError(err, "hearths.by-fid.GET");
  }
}

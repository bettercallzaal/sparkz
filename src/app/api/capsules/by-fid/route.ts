import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/http";
import { publicCapsule } from "@/lib/sanitize";
import type { Capsule } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

// GET /api/capsules/by-fid?fid=123 - Capsules owned by a Farcaster fid, for the
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
      .from("capsules")
      .select("id, slug, name, type, status, bio, metadata, owner_fid, created_at")
      .eq("owner_fid", fid)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = ((data as Capsule[]) ?? []).map((c) => {
      const cleaned = publicCapsule(c);
      const review = (cleaned.metadata as { review?: string })?.review ?? null;
      return {
        slug: cleaned.slug,
        name: cleaned.name,
        type: cleaned.type,
        status: cleaned.status,
        bio: cleaned.bio,
        review, // 'pending' | 'approved' | null so the UI can badge unlisted ones
      };
    });
    return ok(rows);
  } catch (err) {
    return serverError(err, "capsules.by-fid.GET");
  }
}

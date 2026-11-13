import type { NextRequest } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { sessionFid } from "@/lib/session";

const schema = z.object({ slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/) });

// POST /api/admin/claim-hearth - "Make me the owner". An admin signed in with
// Farcaster becomes the owner of a Hearth that has NO owner yet. Admin only; the FID
// is the verified session's, never from the body; a Hearth that already has an owner
// is never changed (the update matches owner_fid IS NULL).
export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;
    const fid = sessionFid(req);
    if (!fid) return badRequest("Sign in with Farcaster to take ownership");

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return zodError(parsed.error);

    const { data, error } = await getServiceClient()
      .from("hearths")
      .update({ owner_fid: fid })
      .eq("slug", parsed.data.slug)
      .is("owner_fid", null)
      .select("slug, owner_fid");
    if (error) throw error;
    if (!data || data.length === 0) {
      return badRequest("That Hearth was not found, or it already has an owner");
    }
    return ok({ slug: data[0].slug, owner_fid: fid });
  } catch (err) {
    return serverError(err, "admin.claimHearth.POST");
  }
}

import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { updateHearthSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { requireHearthOwner } from "@/lib/auth";
import { sleepTransition, type HearthStatus } from "@/lib/hearth-sleep";

// POST /api/capsules/update - the owner (or an admin) edits a Hearth's public
// details: name, bio, about, picture, tags and links. Before this there was no way to
// change any of them after creation.
//
// Gate: requireHearthOwner (verified session FID equals owner_fid, or an admin), plus
// the cross-site guard. Only the fields in updateHearthSchema change; the metadata
// merge keeps everything else (review status, self_serve, farcaster link, owner email)
// exactly as it was. Empty strings clear a field.
export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    const parsed = updateHearthSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return zodError(parsed.error);
    const input = parsed.data;

    const denied = await requireHearthOwner(req, input.hearth_id);
    if (denied) return denied;

    const supabase = getServiceClient();
    const { data: hearth, error: readErr } = await supabase
      .from("hearths")
      .select("slug, status, metadata")
      .eq("id", input.hearth_id)
      .maybeSingle();
    if (readErr) throw readErr;
    if (!hearth) return badRequest("hearth not found");

    const meta = { ...((hearth.metadata ?? {}) as Record<string, unknown>) };
    const setOrClear = (key: string, value: string | undefined) => {
      if (value === undefined) return;
      if (value === "") delete meta[key];
      else meta[key] = value;
    };
    setOrClear("about", input.about);
    setOrClear("image", input.image);
    if (input.tags !== undefined) {
      const tags = [...new Set(input.tags)];
      if (tags.length) meta.tags = tags;
      else delete meta.tags;
    }
    if (input.links !== undefined) {
      const links = Object.fromEntries(
        Object.entries(input.links).filter(([, v]) => typeof v === "string" && v !== ""),
      );
      if (Object.keys(links).length) meta.links = links;
      else delete meta.links;
    }

    const update: Record<string, unknown> = { metadata: meta };
    if (input.asleep !== undefined) {
      const next = sleepTransition(hearth.status as HearthStatus, meta, input.asleep);
      if (next) {
        update.status = next.status;
        update.metadata = next.metadata;
      }
    }
    if (input.name !== undefined) update.name = input.name;
    if (input.bio !== undefined) update.bio = input.bio === "" ? null : input.bio;

    const { error } = await supabase.from("hearths").update(update).eq("id", input.hearth_id);
    if (error) throw error;

    return ok({ slug: hearth.slug });
  } catch (err) {
    return serverError(err, "hearths.update.POST");
  }
}

import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { lightSparkSchema, editSparkSchema } from "@/lib/validation/schemas";
import { badRequest, ok, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { isAdmin, requireHearthOwner } from "@/lib/auth";
import { sessionClaims, sessionFid } from "@/lib/session";
import { blockedOwners } from "@/lib/blocks-server";
import { isBlockedHearth } from "@/lib/moderation";
import type { Spark } from "@/lib/supabase/types";

// Sparks: an event on a Hearth (migration 0008; plan in vault
// notes/sparkz-sparks-table-plan-2026-11-19.md).
//   GET   /api/sparks?slug=<hearth>  public, newest first. Visitors see live and ended
//                                    Sparks; the owner and admins also see planned and
//                                    cancelled ones. Empty for a viewer who blocked the
//                                    Hearth's owner (migration 0009).
//   POST  /api/sparks                owner or admin: light a Spark on a Hearth.
//   PATCH /api/sparks                owner or admin: change a Spark (status, goal, link...).
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const PUBLIC_STATUSES = ["live", "ended"];
const LIST_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug") ?? "";
    if (!SLUG.test(slug)) return badRequest("slug is required.");

    const supabase = getServiceClient();
    const { data: hearth, error: hearthError } = await supabase
      .from("hearths")
      .select("id, owner_fid, owner_wallet")
      .eq("slug", slug)
      .maybeSingle();
    if (hearthError) throw hearthError;
    if (!hearth) return badRequest("No Hearth with that slug.");
    const h = hearth as { id: string; owner_fid: number | null; owner_wallet: string | null };
    if (isBlockedHearth(h, await blockedOwners(sessionClaims(req)))) return ok([] as Spark[]);

    const fid = sessionFid(req);
    const manager = isAdmin(req) || (fid !== null && h.owner_fid !== null && fid === h.owner_fid);

    let query = supabase
      .from("sparks")
      .select("*")
      .eq("hearth_id", h.id)
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT);
    if (!manager) query = query.in("status", PUBLIC_STATUSES);
    const { data, error } = await query;
    // Fail closed: a failed read must never show as "no Sparks".
    if (error) throw error;
    return ok((data ?? []) as Spark[]);
  } catch (err) {
    return serverError(err, "sparks.GET");
  }
}

export async function POST(req: NextRequest) {
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    const body = await req.json().catch(() => null);
    const parsed = lightSparkSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const input = parsed.data;

    const denied = await requireHearthOwner(req, input.hearth_id);
    if (denied) return denied;

    const { data, error } = await getServiceClient()
      .from("sparks")
      .insert({
        hearth_id: input.hearth_id,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        status: input.status ?? "planned",
        goal_metric: input.goal_metric ?? null,
        goal_target: input.goal_target ?? null,
        starts_at: input.starts_at ?? null,
        ends_at: input.ends_at ?? null,
        link: input.link ?? null,
        chain_ref: input.chain_ref ?? {},
        created_by_fid: sessionFid(req),
      })
      .select("*")
      .single();
    if (error) throw error;
    return ok(data as Spark, 201);
  } catch (err) {
    return serverError(err, "sparks.POST");
  }
}

export async function PATCH(req: NextRequest) {
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    const body = await req.json().catch(() => null);
    const parsed = editSparkSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const { id, ...changes } = parsed.data;

    const supabase = getServiceClient();
    const { data: existing, error: readError } = await supabase
      .from("sparks")
      .select("id, hearth_id")
      .eq("id", id)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) return badRequest("No Spark with that id.");
    const spark = existing as { id: string; hearth_id: string };

    const denied = await requireHearthOwner(req, spark.hearth_id);
    if (denied) return denied;

    // Only the fields the caller sent; undefined means "leave as is".
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [k, v] of Object.entries(changes)) if (v !== undefined) update[k] = v;
    if (Object.keys(update).length === 1) return badRequest("Nothing to change.");

    const { data, error } = await supabase
      .from("sparks")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return ok(data as Spark);
  } catch (err) {
    return serverError(err, "sparks.PATCH");
  }
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { badRequest, ok, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { sessionClaims } from "@/lib/session";
import { hearthOwnerIdentity, viewerIdentity } from "@/lib/moderation";
import { blockSchema, unblockSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

// Blocks (migration 0009; App Store guideline 1.2; Zaal D2). A person hides another
// person's Hearths and Sparks from themselves. Every call is for the session identity
// only; no body names the blocker.
//   GET    /api/blocks  the identities this person has blocked, newest first.
//   POST   /api/blocks  { hearth_id }: block the owner of that Hearth. A repeat is deduped.
//   DELETE /api/blocks  { blocked_id }: unblock.
const SIGN_IN_TO_BLOCK = "Sign in to block";
const LIST_LIMIT = 500;

function signInRequired() {
  return NextResponse.json({ ok: false, error: SIGN_IN_TO_BLOCK }, { status: 401 });
}

export async function GET(req: NextRequest) {
  try {
    const me = viewerIdentity(sessionClaims(req));
    if (!me) return signInRequired();

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("user_blocks")
      .select("blocked_id, created_at")
      .eq("blocker_id", me)
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT);
    // Fail closed: a failed read must never show as "nobody blocked".
    if (error) throw error;
    return ok(((data as { blocked_id: string }[]) ?? []).map((r) => r.blocked_id));
  } catch (err) {
    return serverError(err, "blocks.GET");
  }
}

export async function POST(req: NextRequest) {
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    const me = viewerIdentity(sessionClaims(req));
    if (!me) return signInRequired();

    const body = await req.json().catch(() => null);
    const parsed = blockSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { data: hearth, error: hErr } = await supabase
      .from("hearths")
      .select("owner_fid, owner_wallet")
      .eq("id", parsed.data.hearth_id)
      .maybeSingle();
    if (hErr) throw hErr;
    if (!hearth) return badRequest("No Hearth with that id.");

    const owner = hearthOwnerIdentity(hearth as { owner_fid: number | null; owner_wallet: string | null });
    if (!owner) return badRequest("This Hearth has no owner to block.");
    if (owner === me) return badRequest("You cannot block yourself.");

    const { error } = await supabase.from("user_blocks").insert({ blocker_id: me, blocked_id: owner });
    if (error?.code === "23505") return ok({ blocked: owner, deduped: true });
    if (error) throw error;
    return ok({ blocked: owner }, 201);
  } catch (err) {
    return serverError(err, "blocks.POST");
  }
}

export async function DELETE(req: NextRequest) {
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    const me = viewerIdentity(sessionClaims(req));
    if (!me) return signInRequired();

    const body = await req.json().catch(() => null);
    const parsed = unblockSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", me)
      .eq("blocked_id", parsed.data.blocked_id);
    if (error) throw error;
    return ok({ unblocked: parsed.data.blocked_id });
  } catch (err) {
    return serverError(err, "blocks.DELETE");
  }
}

import { getServiceClient } from "@/lib/supabase/server";
import { viewerIdentity } from "@/lib/moderation";
import type { SessionClaims } from "@/lib/session";

// The identities the viewer has blocked (user_blocks, migration 0009), for the read
// filters: Home, Explore, the activity strip, a Hearth page and its Sparks. Signed out
// is an empty set. A failed read is logged and also gives an empty set: the filter is a
// courtesy to the viewer, and the page must still render.
const LIMIT = 500;

export async function blockedOwners(claims: SessionClaims | null): Promise<Set<string>> {
  const me = viewerIdentity(claims);
  if (!me) return new Set();
  try {
    const { data, error } = await getServiceClient()
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", me)
      .limit(LIMIT);
    if (error) {
      console.error("[sparkz:blocks.read]", error);
      return new Set();
    }
    return new Set(((data as { blocked_id: string }[]) ?? []).map((r) => r.blocked_id));
  } catch (err) {
    console.error("[sparkz:blocks.read]", err);
    return new Set();
  }
}

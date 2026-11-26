import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { sessionClaims } from "@/lib/session";
import { PUBLIC_REVIEW_FILTER } from "@/lib/sanitize";
import type { HearthRow } from "@/lib/my-sparkz";

// Shared by /api/me/hearths and /api/me/sparkz. The identity comes from the verified
// session cookie only (an FID, or a lowercased address for a wallet session), never from
// the request, so a person only ever sees their own list.

export type MeIdentity = { fid: number | null; address: string | null; backerId: string };

export function meIdentity(req: NextRequest): MeIdentity | null {
  const claims = sessionClaims(req);
  // The same key /api/boost stores a backing under.
  if (claims?.fid) return { fid: claims.fid, address: claims.address, backerId: `fid:${claims.fid}` };
  if (claims?.address) return { fid: null, address: claims.address, backerId: claims.address };
  return null;
}

const HEARTH_COLS = "id, slug, name, type, status, metadata, created_at";

/** Hearths the person owns, including their own pending ones. */
export async function ownedHearths(me: MeIdentity): Promise<HearthRow[]> {
  const supabase = getServiceClient();
  const q = supabase.from("hearths").select(HEARTH_COLS);
  const { data, error } = await (me.fid ? q.eq("owner_fid", me.fid) : q.eq("owner_wallet", me.address));
  if (error) throw error;
  return (data as HearthRow[]) ?? [];
}

/** Public Hearths by id (pending and rejected left out, like every public list). */
export async function publicHearthsById(ids: string[]): Promise<HearthRow[]> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];
  const { data, error } = await getServiceClient()
    .from("hearths")
    .select(HEARTH_COLS)
    .in("id", unique)
    .or(PUBLIC_REVIEW_FILTER);
  if (error) throw error;
  return (data as HearthRow[]) ?? [];
}

export const SIGN_IN_MY_HEARTHS = "Sign in to see your Hearths";
export const SIGN_IN_MY_SPARKZ = "Sign in to see your Sparkz";

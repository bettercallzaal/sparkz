import { getServiceClient } from "@/lib/supabase/server";
import { readBounty, type ChainBounty } from "./client";

export type HearthBountyRow = { id: string; bounty_id: string | number; tx_hash: string; created_at: string };
export type HearthBountyView =
  | { row: { id: string; bountyId: string; txHash: string }; chain: ChainBounty }
  // The chain read failed: show the row and the poidh link, never a wrong state.
  | { row: { id: string; bountyId: string; txHash: string }; chain: null };

// A Hearth's linked bounties with their live state read from Base. A failed chain read
// for one bounty degrades that bounty only.
export async function listHearthBounties(hearthId: string): Promise<HearthBountyView[]> {
  const { data, error } = await getServiceClient()
    .from("hearth_bounties")
    .select("id, bounty_id, tx_hash, created_at")
    .eq("hearth_id", hearthId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  const rows = (data ?? []) as HearthBountyRow[];
  return Promise.all(
    rows.map(async (r) => {
      const bountyId = String(r.bounty_id);
      const row = { id: r.id, bountyId, txHash: r.tx_hash };
      try {
        return { row, chain: await readBounty(BigInt(bountyId)) };
      } catch (err) {
        console.error("[sparkz:poidh.readBounty]", bountyId, err);
        return { row, chain: null };
      }
    }),
  );
}

// What the Bounties tab needs: the list, and whether bounties are switched on. If the
// hearth_bounties read fails for any reason (migration 0010 not applied yet, DB down), the
// create form must stay hidden: the owner's wallet would otherwise send the real on-chain
// createOpenBounty and Sparkz could not link it. Fail closed.
export async function loadBountiesTab(
  hearthId: string,
): Promise<{ enabled: boolean; items: HearthBountyView[] }> {
  try {
    return { enabled: true, items: await listHearthBounties(hearthId) };
  } catch (err) {
    console.error("[sparkz:hearth.bounties]", err);
    return { enabled: false, items: [] };
  }
}

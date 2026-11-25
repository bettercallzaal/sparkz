import { z } from "zod";

// poidh's MIN_BOUNTY_AMOUNT is read live from the contract; this floor only rejects
// obvious junk before the chain is asked. 0.001 ETH.
export const MIN_BOUNTY_WEI_FLOOR = 1_000_000_000_000_000n;

const hash32 = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "tx_hash must be 0x + 64 hex");

// Body of POST /api/hearth-bounties: recorded AFTER the owner's wallet sent the
// createOpenBounty transaction. The server re-reads the receipt, so name/description here
// are not trusted; they are cross-checked against the on-chain event.
export const recordBountySchema = z.object({
  hearth_id: z.string().uuid(),
  tx_hash: hash32,
});

export const hearthBountyQuery = z.object({ hearth_id: z.string().uuid() });

// Fields the create form sends to the wallet (validated client-side before signing).
export const createBountyFormSchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(4000),
  reward_wei: z
    .string()
    // One refine, not regex + refine: zod 4 runs every check, and BigInt() throws on junk.
    .refine((s) => /^\d{1,30}$/.test(s) && BigInt(s) >= MIN_BOUNTY_WEI_FLOOR, "reward must be whole wei, at least 0.001 ETH"),
});

export type RecordBountyInput = z.infer<typeof recordBountySchema>;

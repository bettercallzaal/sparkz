// BackingProvider seam. Pre-token "spark" backing is provider-agnostic: value can
// settle off-chain (LedgerProvider, the m1 default) OR on-chain via permissionless
// rails (ElizaOS, Bankr) and tokenization rails (Clanker, Empire Builder) - all
// writing the SAME capsule_backers table so the moat stays unified no matter where
// value lands. Adding a provider = a new file + register(), no migration.
//
// Rail notes (m1 = ledger only; the rest are seam-only):
//   ledger  - off-chain treasury ledger (fiat / BYOK / credits). Default.
//   eliza   - ElizaOS agent, MIT + native on-chain. Top on-chain pick.
//   bankr   - @bankrbot REST, on-chain exec on Base/Farcaster.
//   clanker - tokenization/graduation (coin output), Base/Farcaster.
//   empire  - Empire Builder: tokenless empires (create2 + 0xSplits predictable
//             treasury). Read API is public (empirebuilder.world/api); write is
//             partner-whitelisted - needs partner creds before it goes live.

import type { BackingKind, BackerKind } from "@/lib/supabase/types";

export interface CreateBackingInput {
  capsuleId: string;
  backerKind: BackerKind;
  backerId: string;
  kind: BackingKind;
  amountOrQty: number;
  unit?: string;
  metadata?: Record<string, unknown>;
}

export interface BackingRecord {
  id: string;
  capsuleId: string;
  provider: string;
  providerRef: string | null;
  chain: string | null;
  kind: BackingKind;
  amountOrQty: number;
  unit: string | null;
}

export interface BackingProvider {
  readonly id: string;
  createBacking(input: CreateBackingInput): Promise<BackingRecord>;
  getBacking(ref: string): Promise<BackingRecord | null>;
  listBackings(capsuleId: string): Promise<BackingRecord[]>;
}

const registry = new Map<string, BackingProvider>();

export function registerBackingProvider(provider: BackingProvider): void {
  registry.set(provider.id, provider);
}

export function getBackingProvider(id: string): BackingProvider | undefined {
  return registry.get(id);
}

export function listBackingProviders(): BackingProvider[] {
  return [...registry.values()];
}

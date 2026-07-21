import { getServiceClient } from "@/lib/supabase/server";
import type { CapsuleBacker } from "@/lib/supabase/types";
import {
  type BackingProvider,
  type BackingRecord,
  type CreateBackingInput,
  registerBackingProvider,
} from "./index";

// Off-chain ledger. The m1 default: fiat / BYOK / treasury-credit backing with
// no wallet required (V1-SCOPE fiat-or-BYOK onboarding). chain is null; provider_ref
// is the row id. On-chain rails implement the same interface later.

function toRecord(row: CapsuleBacker): BackingRecord {
  return {
    id: row.id,
    capsuleId: row.capsule_id,
    provider: row.provider,
    providerRef: row.provider_ref,
    chain: row.chain,
    kind: row.kind,
    amountOrQty: row.amount_or_qty,
    unit: row.unit,
  };
}

export class LedgerProvider implements BackingProvider {
  readonly id = "ledger";

  async createBacking(input: CreateBackingInput): Promise<BackingRecord> {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("capsule_backers")
      .insert({
        capsule_id: input.capsuleId,
        backer_kind: input.backerKind,
        backer_id: input.backerId,
        kind: input.kind,
        amount_or_qty: input.amountOrQty,
        unit: input.unit ?? null,
        provider: this.id,
        provider_ref: null,
        chain: null,
        metadata: input.metadata ?? {},
      })
      .select("*")
      .single();
    if (error) throw error;

    const row = data as CapsuleBacker;
    // provider_ref for the ledger IS the row id - backfill it so getBacking works.
    await supabase
      .from("capsule_backers")
      .update({ provider_ref: row.id })
      .eq("id", row.id);

    return toRecord({ ...row, provider_ref: row.id });
  }

  async getBacking(ref: string): Promise<BackingRecord | null> {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("capsule_backers")
      .select("*")
      .eq("provider", this.id)
      .eq("provider_ref", ref)
      .maybeSingle();
    if (error) throw error;
    return data ? toRecord(data as CapsuleBacker) : null;
  }

  async listBackings(capsuleId: string): Promise<BackingRecord[]> {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("capsule_backers")
      .select("*")
      .eq("capsule_id", capsuleId)
      .eq("provider", this.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as CapsuleBacker[]).map(toRecord);
  }
}

registerBackingProvider(new LedgerProvider());

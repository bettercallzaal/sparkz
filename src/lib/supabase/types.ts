// Hand-written DB types mirroring supabase/migrations/0001_capsule_foundation.sql.
// Regenerate from Supabase (`generate_typescript_types`) once the project exists;
// until then this keeps the app type-safe against the known schema.

export type CapsuleType = "creator" | "culture" | "oss" | "meme";
export type CapsuleStatus = "spark" | "tokenized" | "dormant";
export type BackerKind = "wallet" | "fid" | "user";
export type BackingKind = "collectable" | "backing" | "boost";
export type SignalStatus =
  | "flagged"
  | "drafted"
  | "approved"
  | "published"
  | "rejected";

export interface Capsule {
  id: string;
  slug: string;
  type: CapsuleType;
  name: string;
  bio: string | null;
  owner_wallet: string | null;
  owner_fid: number | null;
  status: CapsuleStatus;
  economic_config: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CapsuleBacker {
  id: string;
  capsule_id: string;
  backer_kind: BackerKind;
  backer_id: string;
  kind: BackingKind;
  amount_or_qty: number;
  unit: string | null;
  provider: string;
  provider_ref: string | null;
  chain: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Signal {
  id: string;
  capsule_id: string;
  source: string;
  source_meta: Record<string, unknown>;
  text: string;
  why_it_matched: string | null;
  status: SignalStatus;
  flagged_by: string | null;
  approver: string | null;
  approved_via: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignalDraft {
  id: string;
  signal_id: string;
  capsule_id: string;
  model: string | null;
  prompt_version: string | null;
  draft_text: string;
  rank: number | null;
  chosen: boolean;
  approver: string | null;
  reject_reason: string | null;
  created_at: string;
}

export interface MemeReceipt {
  id: string;
  capsule_id: string;
  signal_id: string | null;
  chosen_draft_id: string | null;
  why_it_matched: string | null;
  creator: string | null;
  approver: string | null;
  source_assets: unknown[];
  parent_meme_id: string | null;
  versions: unknown[];
  remixes: unknown[];
  contributors: unknown[];
  reach: number;
  referrals: number;
  backing_generated: number;
  rewards: Record<string, unknown>;
  lessons: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

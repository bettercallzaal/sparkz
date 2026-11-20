// Hand-written DB types mirroring supabase/migrations/0001_hearth_foundation.sql.
// Regenerate from Supabase (`generate_typescript_types`) once the project exists;
// until then this keeps the app type-safe against the known schema.

export type HearthType = "creator" | "culture" | "oss" | "meme";
export type HearthStatus = "spark" | "tokenized" | "dormant";
export type BackerKind = "wallet" | "fid" | "user";
export type BackingKind = "collectable" | "backing" | "boost";

export interface Hearth {
  id: string;
  slug: string;
  type: HearthType;
  name: string;
  bio: string | null;
  owner_wallet: string | null;
  owner_fid: number | null;
  status: HearthStatus;
  economic_config: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface HearthBacker {
  id: string;
  hearth_id: string;
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

// A Spark: an event on a Hearth (migration 0008).
export type SparkKind = "moment" | "token" | "nft" | "bounty" | "event";
export type SparkStatus = "planned" | "live" | "ended" | "cancelled";

export interface Spark {
  id: string;
  hearth_id: string;
  kind: SparkKind;
  title: string;
  body: string | null;
  status: SparkStatus;
  goal_metric: "backers" | "boosts" | null;
  goal_target: number | null;
  starts_at: string | null;
  ends_at: string | null;
  link: string | null;
  chain_ref: { chain_id?: number; contract?: string; tx?: string };
  created_by_fid: number | null;
  created_at: string;
  updated_at: string;
}

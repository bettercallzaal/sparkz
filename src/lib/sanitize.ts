import type { Capsule } from "@/lib/supabase/types";

// Metadata keys that must never reach a public response (PII / abuse-tracking).
const SENSITIVE_META_KEYS = ["owner_email", "ip_hash"] as const;

// Strip sensitive metadata from a capsule before it leaves a public surface.
// Keeps the legit public metadata (farcaster, image, stars, ...).
export function publicCapsule<T extends { metadata: Capsule["metadata"] }>(c: T): T {
  const meta = { ...((c.metadata ?? {}) as Record<string, unknown>) };
  for (const k of SENSITIVE_META_KEYS) delete meta[k];
  return { ...c, metadata: meta };
}

// A backer's public-safe label. Shows a public @handle or a shortened wallet;
// everything else (emails, fids, raw ids) becomes "a supporter" so no PII or raw
// identifier is ever rendered publicly.
export function maskBacker(id: string): string {
  if (id.startsWith("@")) return id;
  if (id.startsWith("0x") && id.length >= 10) return `${id.slice(0, 6)}...${id.slice(-4)}`;
  return "a supporter";
}

// PostgREST `.or()` filter for public listings: show capsules with no review flag
// (operator-created) OR explicitly approved. Hides both `pending` and `rejected`
// self-serve sparks. Use everywhere a public read lists capsules.
export const PUBLIC_REVIEW_FILTER =
  "metadata->>review.is.null,metadata->>review.eq.approved";

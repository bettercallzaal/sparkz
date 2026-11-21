// Report and block (migration 0009). An identity is the text Sparkz keys a person by,
// the same as hearth_backers.backer_id: "fid:<n>" for a Farcaster session, or the
// lower-cased 0x address for a wallet session. Pure, so it is unit-tested.
import type { SessionClaims } from "@/lib/session";

export const REPORT_REASONS = ["spam", "abuse", "ip", "other"] as const;
export const REPORT_TARGETS = ["hearth", "spark"] as const;
export const REPORT_STATUSES = ["open", "reviewed", "dismissed"] as const;

// The verified identity of the person making the request, or null when signed out.
export function viewerIdentity(claims: SessionClaims | null): string | null {
  if (!claims) return null;
  if (claims.fid) return `fid:${claims.fid}`;
  if (claims.address) return claims.address.toLowerCase();
  return null;
}

// The identity that owns a Hearth: its owner FID first, else its owner wallet. Null when
// the Hearth has no owner (an admin-run Hearth), which cannot be blocked.
export function hearthOwnerIdentity(h: { owner_fid?: number | null; owner_wallet?: string | null }): string | null {
  if (h.owner_fid) return `fid:${h.owner_fid}`;
  if (h.owner_wallet) return h.owner_wallet.toLowerCase();
  return null;
}

// True when the viewer has blocked the owner of this Hearth.
export function isBlockedHearth(
  h: { owner_fid?: number | null; owner_wallet?: string | null },
  blocked: ReadonlySet<string>,
): boolean {
  const owner = hearthOwnerIdentity(h);
  return owner !== null && blocked.has(owner);
}

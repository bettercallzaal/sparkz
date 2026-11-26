import type { SessionClaims } from "@/lib/session";

// The ledger key a signed-in backer boosts under: "fid:<n>" for a Farcaster session,
// the lowercased address for a wallet session, null when signed out. /api/boost writes
// it and the Hearth page reads it, so a boost and the "already boosted" check agree.
export function boosterId(claims: SessionClaims | null): string | null {
  if (claims?.fid) return `fid:${claims.fid}`;
  if (claims?.address) return claims.address;
  return null;
}

// Has this viewer already boosted? Read from the backers the Hearth page already loads.
export function viewerBoosted(
  backers: { kind: string; backer_id: string }[],
  claims: SessionClaims | null,
): boolean {
  const id = boosterId(claims);
  return id !== null && backers.some((b) => b.kind === "boost" && b.backer_id === id);
}

export type BoostOutcome =
  | { next: "done"; message: string }
  | { next: "signin" }
  | { next: "error"; message: string };

// What the Boost button does with the /api/boost answer. A duplicate (the route answers
// 200 with deduped: true) lands in the boosted state with a plain line, never silence.
export function boostOutcome(status: number, json: { ok?: boolean; error?: string; data?: { deduped?: boolean } }): BoostOutcome {
  if (json.ok) {
    return json.data?.deduped
      ? { next: "done", message: "You already boosted this Hearth. Once per person." }
      : { next: "done", message: "Boost sent - you're backing the work now." };
  }
  if (status === 401) return { next: "signin" };
  if (status === 409) return { next: "done", message: "You already boosted this Hearth. Once per person." };
  return { next: "error", message: json.error ?? "Could not boost - try again." };
}

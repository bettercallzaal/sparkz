// The two backer_id shapes that only a verified session may produce: "fid:<n>" from a
// Farcaster session and a 0x wallet address from a wallet session (boost/route.ts). A
// typed, unsigned backer in either shape would be stored as that identity and counted as
// that person's backing, so the boost route refuses it.

export const SIGN_IN_FOR_IDENTITY =
  "Sign in to boost as a Farcaster account or wallet. Without signing in, give an email or a name.";

export function looksLikeVerifiedIdentity(value: string): boolean {
  const v = value.trim().toLowerCase();
  return /^fid:/.test(v) || /^0x[0-9a-f]{40}$/.test(v);
}

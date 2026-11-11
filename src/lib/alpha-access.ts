import { isAdminAddress, isAdminFid } from "./admin-identities";

// Private alpha lock (Zaal, 2026-11-11: "make sure no one other than me and u can
// use sparkz while we alpha testing"). While ALPHA_LOCK is true, only the identities
// below can hold a session, and the public write routes (boost, join the team) are
// closed. Reading pages stays open, and so does the waitlist.
//
// To open Sparkz up: add people to the two sets, or set ALPHA_LOCK to false.
//
// Like the admin list, this is only ever checked AFTER a verified sign-in (Farcaster
// SIWF / Quick Auth, or SIWE), never against a value from a request body. FIDs and
// addresses are public identifiers, so pinning them in code is safe.
export const ALPHA_LOCK = true;

export const ALPHA_CLOSED_MESSAGE =
  "Sparkz is in private testing right now. Join the waitlist and we will let you know when it opens.";

// IMan Afrikah's Farcaster FID. Admins (lib/admin-identities.ts) are always allowed.
export const ALPHA_FIDS: ReadonlySet<number> = new Set([1057869]);

// IMan Afrikah's wallet, lowercased.
export const ALPHA_ADDRESSES: ReadonlySet<string> = new Set([
  "0xf73485a61856ab07ad57152151db3ab99df9a8ea",
]);

export interface AlphaIdentity {
  fid?: number | null;
  address?: string | null;
}

// May this verified identity use Sparkz right now? Fails CLOSED while locked: no
// identity, or one that is on neither list, is refused.
export function isAlphaAllowed(
  identity: AlphaIdentity | null | undefined,
  locked: boolean = ALPHA_LOCK,
): boolean {
  if (!locked) return true;
  if (!identity) return false;
  const { fid, address } = identity;
  if (isAdminFid(fid) || isAdminAddress(address)) return true;
  if (typeof fid === "number" && ALPHA_FIDS.has(fid)) return true;
  if (typeof address === "string" && ALPHA_ADDRESSES.has(address.toLowerCase())) return true;
  return false;
}

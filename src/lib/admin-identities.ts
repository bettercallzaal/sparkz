// Who is a Sparkz admin (Zaal's ruling, 2026-10-18). Humans sign in to /admin as one
// of these identities; nobody types SPARKZ_ADMIN_TOKEN any more (it stays only as
// the background agent's machine credential, sent as a header - see lib/auth.ts).
//
// Server-side allowlist. A FID or address is only ever checked here AFTER it has been
// proven by a verified sign-in (Farcaster SIWF / Quick Auth, or SIWE) - never taken
// from a request body. Both are public identifiers, so pinning them in code is safe.

// Zaal's Farcaster FID.
export const ADMIN_FIDS: ReadonlySet<number> = new Set([19640]);

// zaal.eth, resolved on Ethereum mainnet at block 26219375 (2026-10-18T12:13:35Z).
// Two independent RPCs agreed (publicnode, 1rpc). It is an EOA (no contract code at
// that block). If zaal.eth is ever re-pointed, re-resolve and update this pin; it is
// deliberately NOT resolved at runtime, so an ENS change cannot silently add an admin.
export const ADMIN_ADDRESSES: ReadonlySet<string> = new Set([
  "0x7234c36a71ec237c2ae7698e8916e0735001e9af",
]);

export function isAdminFid(fid: number | null | undefined): boolean {
  return typeof fid === "number" && ADMIN_FIDS.has(fid);
}

export function isAdminAddress(address: string | null | undefined): boolean {
  return typeof address === "string" && ADMIN_ADDRESSES.has(address.toLowerCase());
}

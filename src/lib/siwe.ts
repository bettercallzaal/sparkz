import { verifyMessage } from "viem";
import { parseSiweMessage, validateSiweMessage } from "viem/siwe";

// Sign-In with Ethereum (EIP-4361) for the admin console, on viem's own siwe utilities
// (viem is already a dependency). Pure apart from the signature check, so it is
// unit-tested (siwe.test.ts). The route (/api/auth/siwe) supplies the server-issued
// nonce and then checks the recovered address against the admin allowlist.

// Chains a sign-in message may name: Ethereum mainnet (where zaal.eth lives) and Base
// (the network the Sparkz wallet config connects to). An EOA signature does not
// depend on the chain; pinning it stops a message minted for another chain's app.
export const SIWE_CHAIN_IDS: ReadonlySet<number> = new Set([1, 8453]);

// A message must say when it expires, and must not claim to live longer than this.
export const SIWE_MAX_LIFETIME_MS = 10 * 60 * 1000;

// Verify a SIWE message + signature and return the signer's lowercased address.
// Throws on any failure. Checks, in order: parse, domain, nonce, chain, an explicit
// expiry no more than SIWE_MAX_LIFETIME_MS after issuance, validity window at `now`,
// then the EOA signature.
export async function verifySiweLogin(args: {
  message: string;
  signature: `0x${string}`;
  nonce: string;
  domain: string;
  now?: Date;
}): Promise<string> {
  const now = args.now ?? new Date();
  const parsed = parseSiweMessage(args.message);
  if (!parsed.address) throw new Error("no address");
  if (parsed.domain !== args.domain) throw new Error("domain mismatch");
  if (parsed.nonce !== args.nonce) throw new Error("nonce mismatch");
  if (typeof parsed.chainId !== "number" || !SIWE_CHAIN_IDS.has(parsed.chainId)) {
    throw new Error("chain not allowed");
  }
  if (!parsed.issuedAt || !parsed.expirationTime) throw new Error("expiry required");
  if (parsed.expirationTime.getTime() - parsed.issuedAt.getTime() > SIWE_MAX_LIFETIME_MS) {
    throw new Error("expiry too long");
  }
  if (parsed.issuedAt.getTime() > now.getTime() + 60_000) throw new Error("issued in the future");
  // Domain, nonce, notBefore and expirationTime against `now`.
  if (!validateSiweMessage({ message: parsed, domain: args.domain, nonce: args.nonce, time: now })) {
    throw new Error("message not valid now");
  }
  const ok = await verifyMessage({
    address: parsed.address,
    message: args.message,
    signature: args.signature,
  });
  if (!ok) throw new Error("bad signature");
  return parsed.address.toLowerCase();
}

import { createPublicClient, http, isAddress, parseAbi, type Address } from "viem";
import { optimism } from "viem/chains";

// Hats Protocol: the first free hat (Zaal, 3 Nov 2026: "Sparkz need to get people to get
// their first free hats. That's how you can start commitment"). The ZAO tree is tree 226 on
// Optimism. No private key anywhere (Zaal, 4 Nov 2026: "i dont wanna ever use private keys if
// i can avoid it"): the member claims the hat from their own wallet through the tree's
// MultiClaimsHatter (Hats' claims module, set up once in the Hats app). The module wears an
// admin hat above the Member hat, so Hats.sol lets it mint; the member pays the Optimism gas
// (a fraction of a cent). The hat is soulbound by protocol and capped by its max supply.

export const HATS_ADDRESS: Address = "0x3bc1A0Ad72417f2d411118085256fC53CBdDd137"; // same on every chain
export const HATS_CHAIN_ID = optimism.id;

export const hatsAbi = parseAbi([
  "function isWearerOfHat(address wearer, uint256 hatId) view returns (bool)",
  "function isAdminOfHat(address user, uint256 hatId) view returns (bool)",
  "function mintHat(uint256 hatId, address wearer) returns (bool)",
  "function viewHat(uint256 hatId) view returns (string details, uint32 maxSupply, uint32 supply, address eligibility, address toggle, string imageURI, uint16 lastHatId, bool mutable_, bool active)",
]);

// Hats-Protocol/multi-claims-hatter, src/MultiClaimsHatter.sol.
export const claimsHatterAbi = parseAbi([
  "function claimHat(uint256 hatId)",
  "function isClaimableBy(uint256 hatId) view returns (bool)",
  "function accountCanClaim(address account, uint256 hatId) view returns (bool)",
]);

// A hat id as the Hats app shows it: "226.1.1.1.1.5", or as hex "0x000000e2...", or a
// plain decimal uint256. The tree id takes the top 32 bits, then 16 bits per level.
// (BigInt() calls, not literals: the tsconfig target predates ES2020.)
const B = BigInt;
const TREE_SHIFT = B(224); // top 32 bits
const LEVEL_BITS = B(16);
const LEVEL_MASK = B(0xffff);

export function parseHatId(input: string): bigint | null {
  const s = input.trim();
  if (!s) return null;
  if (/^0x[0-9a-fA-F]{1,64}$/.test(s)) return B(s);
  if (/^\d+$/.test(s)) {
    // A bare number that fits the tree field is a top hat ("226"); anything bigger is a raw uint256 id.
    const v = B(s);
    if (v <= B(0xffffffff)) return v > B(0) ? v << TREE_SHIFT : null;
    return v;
  }
  if (/^\d+(\.\d+){1,14}$/.test(s)) {
    const [tree, ...levels] = s.split(".").map((n) => B(n));
    if (tree <= B(0) || tree > B(0xffffffff) || levels.some((l) => l <= B(0) || l > LEVEL_MASK)) return null;
    let id = tree << TREE_SHIFT;
    let shift = TREE_SHIFT - LEVEL_BITS;
    for (const level of levels) {
      id |= level << shift;
      shift -= LEVEL_BITS;
    }
    return id;
  }
  return null;
}

// "226.1.1.1.1.5" for a hat id, for logs and the UI.
export function prettyHatId(id: bigint): string {
  const parts = [Number(id >> TREE_SHIFT)];
  for (let shift = TREE_SHIFT - LEVEL_BITS; shift >= B(0); shift -= LEVEL_BITS) {
    const level = Number((id >> shift) & LEVEL_MASK);
    if (!level) break;
    parts.push(level);
  }
  return parts.join(".");
}

export type HatsConfig = { hatId: bigint; claimsHatter: Address | null; rpcUrl: string };

export function hatsConfig(): HatsConfig | null {
  const hatId = parseHatId(process.env.HATS_MEMBER_HAT_ID ?? "");
  if (!hatId) return null;
  const hatter = (process.env.NEXT_PUBLIC_HATS_CLAIMS_HATTER ?? "").trim();
  return {
    hatId,
    claimsHatter: isAddress(hatter) ? (hatter as Address) : null,
    rpcUrl: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  };
}

export const hatsConfigured = () => hatsConfig() !== null;
// Open for claims when the module is set and, on chain, wears an admin hat and marks the
// Member hat claimable. Read live so switching it off in the Hats app takes effect at once.
export async function hatsClaimable(cfg = hatsConfig()): Promise<boolean> {
  if (!cfg?.claimsHatter) return false;
  return publicClient(cfg).readContract({
    address: cfg.claimsHatter,
    abi: claimsHatterAbi,
    functionName: "isClaimableBy",
    args: [cfg.hatId],
  });
}

function publicClient(cfg: HatsConfig) {
  return createPublicClient({ chain: optimism, transport: http(cfg.rpcUrl) });
}

export async function isWearer(address: Address, cfg = hatsConfig()): Promise<boolean> {
  if (!cfg) return false;
  return publicClient(cfg).readContract({
    address: HATS_ADDRESS,
    abi: hatsAbi,
    functionName: "isWearerOfHat",
    args: [address, cfg.hatId],
  });
}

export async function hatSupply(cfg = hatsConfig()): Promise<{ supply: number; max: number } | null> {
  if (!cfg) return null;
  const hat = await publicClient(cfg).readContract({ address: HATS_ADDRESS, abi: hatsAbi, functionName: "viewHat", args: [cfg.hatId] });
  return { supply: hat[2], max: hat[1] };
}

import { createPublicClient, createWalletClient, http, parseAbi, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimism } from "viem/chains";

// Hats Protocol: the first free hat (Zaal, 3 Nov 2026: "Sparkz need to get people to get
// their first free hats. That's how you can start commitment"). The ZAO tree is tree 226 on
// Optimism; the Member hat sits under a Sparkz admin hat that the relayer wallet wears, so
// the relayer can mint it straight from Hats.sol (no claims module, no gas for the member).
//
// Server-only: HATS_RELAYER_PRIVATE_KEY never reaches the browser. The hat itself is
// soulbound by protocol (no wearer transfer), max supply is set on the hat, and the
// relayer can only mint hats it admins, so the blast radius of this key is "more free hats".

export const HATS_ADDRESS: Address = "0x3bc1A0Ad72417f2d411118085256fC53CBdDd137"; // same on every chain
export const HATS_CHAIN_ID = optimism.id;

export const hatsAbi = parseAbi([
  "function isWearerOfHat(address wearer, uint256 hatId) view returns (bool)",
  "function isAdminOfHat(address user, uint256 hatId) view returns (bool)",
  "function mintHat(uint256 hatId, address wearer) returns (bool)",
  "function viewHat(uint256 hatId) view returns (string details, uint32 maxSupply, uint32 supply, address eligibility, address toggle, string imageURI, uint16 lastHatId, bool mutable_, bool active)",
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

export type HatsConfig = { hatId: bigint; relayerKey: Hex | null; rpcUrl: string };

export function hatsConfig(): HatsConfig | null {
  const hatId = parseHatId(process.env.HATS_MEMBER_HAT_ID ?? "");
  if (!hatId) return null;
  const key = (process.env.HATS_RELAYER_PRIVATE_KEY ?? "").trim();
  return {
    hatId,
    relayerKey: /^0x[0-9a-fA-F]{64}$/.test(key) ? (key as Hex) : null,
    rpcUrl: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  };
}

export const hatsConfigured = () => hatsConfig() !== null;
export const hatsCanMint = () => hatsConfig()?.relayerKey != null;

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

export class HatsMintError extends Error {}

// Mints the Member hat to `wearer` from the relayer wallet. Idempotent in spirit: a wearer
// who already has it gets `{ already: true }` and no transaction.
export async function mintMemberHat(wearer: Address): Promise<{ tx: Hex | null; already: boolean }> {
  const cfg = hatsConfig();
  if (!cfg) throw new HatsMintError("Hats not configured (HATS_MEMBER_HAT_ID)");
  if (!cfg.relayerKey) throw new HatsMintError("No relayer key (HATS_RELAYER_PRIVATE_KEY)");
  const reader = publicClient(cfg);
  if (await isWearer(wearer, cfg)) return { tx: null, already: true };

  const account = privateKeyToAccount(cfg.relayerKey);
  const admin = await reader.readContract({ address: HATS_ADDRESS, abi: hatsAbi, functionName: "isAdminOfHat", args: [account.address, cfg.hatId] });
  if (!admin) throw new HatsMintError(`Relayer ${account.address} is not an admin of hat ${prettyHatId(cfg.hatId)}`);

  const wallet = createWalletClient({ account, chain: optimism, transport: http(cfg.rpcUrl) });
  const { request } = await reader.simulateContract({
    account,
    address: HATS_ADDRESS,
    abi: hatsAbi,
    functionName: "mintHat",
    args: [cfg.hatId, wearer],
  });
  const tx = await wallet.writeContract(request);
  await reader.waitForTransactionReceipt({ hash: tx, timeout: 60_000 });
  return { tx, already: false };
}

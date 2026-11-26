// Token Spark: a Hearth whose Spark kind is "token" shows its token as read straight from
// Base. Zaal, 24 Nov 2026 (vault decisions/ruling-2026-11-24-max-chat-1245.md items 1-2):
// ZABAL is the first template, the kind lives in hearths.metadata jsonb (no migration),
// the server reads Base directly, and a Clanker link sits beside it. Any Hearth can
// activate any Spark type whenever its creator decides, so nothing here is an ordered step.
//
// Everything on the page is either read from chain (token, vault, locker recipients) or
// labelled "not read from chain yet" or "planned". Never a number from memory.
// No new dependency or env var: viem is already in the repo and its Base chain definition
// carries the public RPC (https://mainnet.base.org).

import { createPublicClient, getAddress, http, isAddress, parseAbi, type Address } from "viem";
import { base } from "viem/chains";
import { z } from "zod";

// The Clanker v4 vault on Base. Checked on 24 Nov 2026 by calling allocation(ZABAL) on it.
export const CLANKER_VAULT_BASE: Address = "0x8E845EAd15737bF71904A30BdDD3aEE76d6ADF6C";

const addressSchema = z.string().refine((v) => isAddress(v, { strict: false }), "not an address");

// metadata.spark on a Hearth. Only the token kind exists today; other kinds parse as null.
export const tokenSparkSchema = z.object({
  kind: z.literal("token"),
  chain: z.literal("base").default("base"),
  token_address: addressSchema,
  vault_address: addressSchema.optional(),
  locker_address: addressSchema.optional(),
});
export type TokenSparkMeta = z.infer<typeof tokenSparkSchema>;

// ZABAL, so the live Hearth shows its token Spark without a database edit. A row's own
// metadata.spark wins over this. Token address: zao-vault notes/folded-artifacts/
// zao-repo-dependency-architecture.md:143 gives 0xbB48..., full address read back on
// chain (name ZABAL, symbol ZABAL). Locker: the address Clanker's API lists for the
// token, confirmed by tokenRewards(ZABAL) answering on it.
export const KNOWN_TOKEN_SPARKS: Record<string, TokenSparkMeta> = {
  zabal: {
    kind: "token",
    chain: "base",
    token_address: "0xbB48f19B0494Ff7C1fE5Dc2032aeEE14312f0b07",
    locker_address: "0x63D2DfEA64b3433F4071A98665bcD7Ca14d93496",
  },
};

// The Hearth's own metadata.spark when it is a valid token Spark, else the known one for
// the slug, else null. Anything malformed reads as null, so a bad row never breaks a page.
export function readTokenSpark(slug: string, metadata: unknown): TokenSparkMeta | null {
  const m = (metadata && typeof metadata === "object" ? metadata : {}) as Record<string, unknown>;
  if (m.spark !== undefined) {
    const parsed = tokenSparkSchema.safeParse(m.spark);
    if (parsed.success) return parsed.data;
  }
  return KNOWN_TOKEN_SPARKS[slug] ?? null;
}

export function clankerUrl(tokenAddress: string): string {
  return `https://www.clanker.world/clanker/${tokenAddress}`;
}

const tokenAbi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function admin() view returns (address)",
]);
// ClankerVault.allocation(token): total, claimed, the end of the lockup, the end of vesting, admin.
const vaultAbi = parseAbi([
  "function allocation(address token) view returns (address token, uint256 amountTotal, uint256 amountClaimed, uint256 lockupEndTime, uint256 vestingEndTime, address admin)",
]);
const lockerAbi = parseAbi([
  "function tokenRewards(address token) view returns ((address token, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, uint256 positionId, uint256 numPositions, uint16[] rewardBps, address[] rewardAdmins, address[] rewardRecipients))",
]);

export interface ChainReader {
  readContract(args: {
    address: Address;
    abi: readonly unknown[];
    functionName: string;
    args?: readonly unknown[];
  }): Promise<unknown>;
}

export interface TokenFacts {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  admin: Address;
}
export interface VaultFacts {
  amountTotal: bigint;
  amountClaimed: bigint;
  lockupEndTime: number; // unix seconds
  vestingEndTime: number;
  admin: Address;
}
export interface RewardRecipient {
  bps: number;
  recipient: Address;
  admin: Address;
}
export interface TokenSparkChain {
  // One source per section; null means "not read from chain yet" (read failed or no address).
  token: TokenFacts | null;
  vault: VaultFacts | null;
  rewards: RewardRecipient[] | null;
}

const asAddress = (v: unknown): Address | null =>
  typeof v === "string" && isAddress(v, { strict: false }) ? getAddress(v) : null;

// Each section is read on its own (Promise.allSettled), so one failing call blanks that
// section only. Errors are not passed up: the page shows "not read from chain yet".
export async function readTokenSparkChain(
  meta: TokenSparkMeta,
  client: ChainReader = createPublicClient({ chain: base, transport: http(undefined, { timeout: 8000 }) }),
): Promise<TokenSparkChain> {
  const token = getAddress(meta.token_address);
  const vault = getAddress(meta.vault_address ?? CLANKER_VAULT_BASE);
  const call = (address: Address, abi: readonly unknown[], functionName: string, args: readonly unknown[] = []) =>
    client.readContract({ address, abi, functionName, args });

  const [tokenRes, vaultRes, rewardsRes] = await Promise.allSettled([
    Promise.all([
      call(token, tokenAbi, "name"),
      call(token, tokenAbi, "symbol"),
      call(token, tokenAbi, "decimals"),
      call(token, tokenAbi, "totalSupply"),
      call(token, tokenAbi, "admin"),
    ]),
    call(vault, vaultAbi, "allocation", [token]),
    meta.locker_address
      ? call(getAddress(meta.locker_address), lockerAbi, "tokenRewards", [token])
      : Promise.reject(new Error("no locker address")),
  ]);

  let tokenFacts: TokenFacts | null = null;
  if (tokenRes.status === "fulfilled") {
    const [name, symbol, decimals, totalSupply, admin] = tokenRes.value;
    const adminAddr = asAddress(admin);
    if (typeof name === "string" && typeof symbol === "string" && typeof decimals === "number" && typeof totalSupply === "bigint" && adminAddr) {
      tokenFacts = { name, symbol, decimals, totalSupply, admin: adminAddr };
    }
  }

  let vaultFacts: VaultFacts | null = null;
  if (vaultRes.status === "fulfilled" && Array.isArray(vaultRes.value)) {
    const [vToken, total, claimed, lockEnd, vestEnd, admin] = vaultRes.value as unknown[];
    const adminAddr = asAddress(admin);
    // An empty allocation (no row for this token) comes back with a zero token address.
    if (asAddress(vToken) === token && typeof total === "bigint" && typeof claimed === "bigint" && total > BigInt(0) && adminAddr) {
      vaultFacts = {
        amountTotal: total,
        amountClaimed: claimed,
        lockupEndTime: Number(lockEnd),
        vestingEndTime: Number(vestEnd),
        admin: adminAddr,
      };
    }
  }

  let rewards: RewardRecipient[] | null = null;
  if (rewardsRes.status === "fulfilled" && rewardsRes.value && typeof rewardsRes.value === "object") {
    const r = rewardsRes.value as { rewardBps?: unknown; rewardAdmins?: unknown; rewardRecipients?: unknown };
    const bps = r.rewardBps;
    const admins = r.rewardAdmins;
    const recipients = r.rewardRecipients;
    if (Array.isArray(bps) && Array.isArray(admins) && Array.isArray(recipients) && bps.length > 0 && bps.length === recipients.length && admins.length === recipients.length) {
      const rows: RewardRecipient[] = [];
      for (let i = 0; i < bps.length; i++) {
        const recipient = asAddress(recipients[i]);
        const admin = asAddress(admins[i]);
        if (typeof bps[i] !== "number" || !recipient || !admin) {
          rows.length = 0;
          break;
        }
        rows.push({ bps: bps[i] as number, recipient, admin });
      }
      if (rows.length > 0) rewards = rows;
    }
  }

  return { token: tokenFacts, vault: vaultFacts, rewards };
}

// Whole tokens, grouped: 30000000000000000000000000000 at 18 decimals -> "30,000,000,000".
export function formatTokenAmount(raw: bigint, decimals: number): string {
  const whole = raw / BigInt(10) ** BigInt(decimals);
  return whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// A share as a percent string from two bigints, to two decimals, trailing zeros trimmed:
// 3e28 of 1e29 -> "30%". Null when the whole is zero.
export function percentOf(part: bigint, whole: bigint): string | null {
  if (whole <= BigInt(0)) return null;
  const hundredths = Number((part * BigInt(10000)) / whole) / 100;
  return `${hundredths}%`;
}

export function shortAddress(a: string): string {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

// The page's rows. "chain" rows were read on Base; "planned" rows are intentions that are
// not on chain; "pending" rows are not read from chain yet. Kept as data so a test can pin
// the labels. No row says anything pays out, earns or shares fees.
export type RowSource = "chain" | "planned" | "pending";
export interface SparkRow {
  label: string;
  value: string;
  source: RowSource;
  href?: string;
}

export function buildTokenSparkRows(meta: TokenSparkMeta, chain: TokenSparkChain, nowSeconds = Math.floor(Date.now() / 1000)): SparkRow[] {
  const rows: SparkRow[] = [];
  const addrHref = (a: string) => `https://basescan.org/address/${a}`;
  const t = chain.token;

  if (t) {
    rows.push({ label: "Token", value: `${t.name} (${t.symbol})`, source: "chain", href: addrHref(meta.token_address) });
    rows.push({ label: "Total supply", value: formatTokenAmount(t.totalSupply, t.decimals), source: "chain" });
    rows.push({ label: "Token admin", value: shortAddress(t.admin), source: "chain", href: addrHref(t.admin) });
  } else {
    rows.push({ label: "Token", value: "not read from chain yet", source: "pending", href: addrHref(meta.token_address) });
  }

  const v = chain.vault;
  if (v && t) {
    rows.push({
      label: "Community vault",
      value: `${formatTokenAmount(v.amountTotal, t.decimals)} ${t.symbol}`,
      source: "chain",
    });
    const lockEnded = v.lockupEndTime <= nowSeconds;
    rows.push({
      label: "Vault lock",
      value: `${lockEnded ? "ended" : "ends"} ${new Date(v.lockupEndTime * 1000).toISOString().slice(0, 10)}${v.vestingEndTime > v.lockupEndTime ? `, vesting to ${new Date(v.vestingEndTime * 1000).toISOString().slice(0, 10)}` : ", no vesting after the lock"}`,
      source: "chain",
    });
    rows.push({
      label: "Vault claimed so far",
      value: `${formatTokenAmount(v.amountClaimed, t.decimals)} of ${formatTokenAmount(v.amountTotal, t.decimals)}`,
      source: "chain",
    });
    rows.push({ label: "Vault admin", value: shortAddress(v.admin), source: "chain", href: addrHref(v.admin) });
  } else {
    rows.push({ label: "Community vault, lock", value: "not read from chain yet", source: "pending" });
  }

  if (chain.rewards) {
    for (const r of chain.rewards) {
      rows.push({ label: "Locker recipient", value: shortAddress(r.recipient), source: "chain", href: addrHref(r.recipient) });
    }
  } else {
    rows.push({ label: "Locker recipients", value: "not read from chain yet", source: "pending" });
  }

  // Not readable from a public contract call here, so never shown as a number.
  rows.push({ label: "Airdrop share", value: "not read from chain yet", source: "pending" });
  rows.push({ label: "Liquidity share", value: "not read from chain yet", source: "pending" });
  // Zaal, 24 Nov 2026 (ruling item 3): planned until sent.
  rows.push({ label: "ZAO teammates", value: "planned, not sent", source: "planned" });
  rows.push({ label: "Cashless man", value: "planned, not sent", source: "planned" });
  return rows;
}

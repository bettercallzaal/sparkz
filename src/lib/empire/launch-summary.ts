import { z } from "zod";

// Turns the Clanker v4 tokenConfig that Empire returns into plain facts the owner reads
// BEFORE signing: who gets which share of trading fees, the vault, the supply. Nothing
// here is hardcoded from marketing copy; every number comes from the config itself, plus
// two Clanker v4 constants checked on Base mainnet on 24 Nov 2026.

// Clanker v4 fee hooks (static + dynamic, v1 and v2) on Base: protocolFee() = 2000 bps.
// Clanker keeps 20% of every LP fee before the reward recipients split the rest.
export const CLANKER_PROTOCOL_BPS = 2000;
// Clanker v4 tokens have a fixed supply of 100 billion, minted once at deploy.
export const CLANKER_V4_SUPPLY = 100_000_000_000;
// Clanker v4 factory on Base (clanker-sdk 4.2.16, CLANKERS.clanker_v4.address).
export const CLANKER_V4_FACTORY_BASE = "0xE85A59c628F7d27878ACeB4bf3b35733630083a9";
export const BASE_CHAIN_ID = 8453;
// Empire Builder's own fee wallet. Empire's deploy-empire check requires 2000 bps of the
// reward pool paid to it (Empire API docs, POST /api/deploy-empire). Read on Base from the
// Clanker v4 LP locker (tokenRewards) of Empire launches on 24 Nov 2026: every one since at
// least Aug 2026 pays 2000 bps to this address (AI SPORK, Orlo Wallet, Grok bot,
// EvolutionStyle, Test2 Oct30, Free), so 2000 of the 8000 bps left after Clanker = 16% of
// all trading fees. Any other wallet in that slot blocks the launch.
export const EMPIRE_FEE_WALLET = "0xa22434c246217E2a1ea0Eab8e5a510eE3caF8b66";
export const EMPIRE_FEE_BPS = 2000;

export interface FeeRecipient {
  recipient: string;
  admin: string;
  bps: number; // share of the post-Clanker reward pool, out of 10000
  pctOfTradingFees: number; // share of ALL trading fees, after Clanker's 20%
  token: string; // which side of the pool it is paid in: Both, Paired or Clanker
}

export interface LaunchSummary {
  name: string;
  symbol: string;
  image: string;
  tokenAdmin: string;
  supply: number;
  vaultPct: number;
  vaultLockDays: number;
  vaultVestDays: number;
  feeText: string;
  sniperFees: boolean;
  devBuy: boolean;
  airdrop: boolean;
  clankerPct: number;
  recipients: FeeRecipient[];
  problems: string[]; // anything that should stop a launch
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" ? (v as Obj) : {});
const num = (v: unknown): number => (typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const days = (seconds: unknown): number => {
  const s = num(seconds);
  return Number.isFinite(s) ? Math.round(s / 86400) : 0;
};

// Clanker fee values are in bps (100 = 1%).
const pct = (bps: unknown): string => {
  const n = num(bps);
  return Number.isFinite(n) ? `${n / 100}%` : "?";
};

export function summarizeTokenConfig(
  config: unknown,
  expect: { creator: string; empireWallet?: string },
): LaunchSummary {
  // Always checked against Empire's real wallet unless a caller names another (tests).
  const empireWallet = (expect.empireWallet ?? EMPIRE_FEE_WALLET).toLowerCase();
  const c = obj(config);
  const fees = obj(c.fees);
  const vault = obj(c.vault);
  const rewards = obj(c.rewards);
  const list = Array.isArray(rewards.recipients) ? (rewards.recipients as unknown[]) : [];
  const problems: string[] = [];

  const keep = (10000 - CLANKER_PROTOCOL_BPS) / 10000; // 0.8
  const recipients: FeeRecipient[] = list.map((r) => {
    const o = obj(r);
    const bps = num(o.bps);
    return {
      recipient: str(o.recipient),
      admin: str(o.admin),
      bps,
      pctOfTradingFees: Math.round(((bps / 10000) * keep * 100) * 100) / 100,
      token: str(o.token) || "Both",
    };
  });

  const total = recipients.reduce((s, r) => s + (Number.isFinite(r.bps) ? r.bps : 0), 0);
  if (recipients.length === 0) problems.push("No fee recipients in the config");
  else if (total !== 10000) problems.push(`Fee shares add up to ${total} bps, not 10000`);

  const creator = expect.creator.toLowerCase();
  if (str(c.tokenAdmin).toLowerCase() !== creator) {
    problems.push("Token admin is not your connected wallet");
  }
  if (!recipients.some((r) => r.recipient.toLowerCase() === creator)) {
    problems.push("Your wallet is not one of the fee recipients");
  }
  const unknown = recipients.filter(
    (r) => r.recipient.toLowerCase() !== creator && r.recipient.toLowerCase() !== empireWallet,
  );
  if (unknown.length > 0) {
    problems.push(`${unknown.length} fee recipient(s) are neither you nor Empire`);
  }
  const empireShares = recipients.filter((r) => r.recipient.toLowerCase() === empireWallet);
  if (empireShares.length !== 1 || empireShares[0].bps !== EMPIRE_FEE_BPS) {
    problems.push("Empire's fee share is missing or not exactly 20% of the reward pool");
  }
  // Empire's deploy-empire check requires exactly 2000 bps to its own wallet. Any other
  // non-creator share is unexplained, so it blocks the launch.
  const others = recipients.filter((r) => r.recipient.toLowerCase() !== creator);
  if (others.length > 1 || others.some((r) => r.bps !== 2000)) {
    problems.push("A fee share goes somewhere other than you and Empire's 20%");
  }

  const devBuy = Boolean(c.devBuy && num(obj(c.devBuy).ethAmount) > 0);
  if (devBuy) problems.push("The config buys coins at launch (dev buy); Sparkz never does that");
  const airdrop = Boolean(c.airdrop && Object.keys(obj(c.airdrop)).length > 0);
  if (airdrop) problems.push("The config includes an airdrop; Sparkz launches none");

  let feeText = "unknown";
  if (fees.type === "static") {
    feeText = `Static: ${pct(fees.clankerFee)} on coin sells, ${pct(fees.pairedFee)} on WETH side`;
  } else if (fees.type === "dynamic") {
    feeText = `Dynamic: ${pct(fees.baseFee)} base, up to ${pct(fees.maxFee)} in volatile trading`;
  }

  return {
    name: str(c.name),
    symbol: str(c.symbol),
    image: str(c.image),
    tokenAdmin: str(c.tokenAdmin),
    supply: CLANKER_V4_SUPPLY,
    vaultPct: Number.isFinite(num(vault.percentage)) ? num(vault.percentage) : 0,
    vaultLockDays: days(vault.lockupDuration),
    vaultVestDays: days(vault.vestingDuration),
    feeText,
    sniperFees: Boolean(c.sniperFees),
    devBuy,
    airdrop,
    clankerPct: CLANKER_PROTOCOL_BPS / 100,
    recipients,
    problems,
  };
}

// The token a Clanker deploy tx created: the contract that minted the supply
// (an ERC-20 Transfer from the zero address). Used to resume a launch from its tx hash.
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_TOPIC = "0x" + "0".repeat(64);
export function tokenFromReceipt(logs: { address: string; topics: readonly string[] }[]): string | null {
  const mint = logs.find((l) => l.topics[0] === TRANSFER && l.topics[1] === ZERO_TOPIC);
  return mint ? mint.address : null;
}

// The shape Sparkz accepts from Empire's /get-token-config before anything reaches the
// browser (review round 2, item 2). Extra fields pass through untouched; these must exist.
const addr = z.string().regex(/^0x[0-9a-fA-F]{40}$/);
const bps = z.union([z.number().int(), z.string().regex(/^\d+$/)]);
export const clankerTokenConfigSchema = z
  .object({
    name: z.string().min(1),
    symbol: z.string().min(1),
    image: z.string(),
    tokenAdmin: addr,
    rewards: z
      .object({
        recipients: z.array(z.object({ recipient: addr, admin: addr, bps }).passthrough()).min(1),
      })
      .passthrough(),
  })
  .passthrough();

// Server-side gate on Empire's answer: the schema, then every check the preview shows.
// Returns the reasons to refuse (empty = safe to hand to the owner's wallet).
export function tokenConfigRefusals(config: unknown, creator: string): string[] {
  const parsed = clankerTokenConfigSchema.safeParse(config);
  if (!parsed.success) return ["Empire's launch config is not in the expected shape"];
  return summarizeTokenConfig(config, { creator }).problems;
}

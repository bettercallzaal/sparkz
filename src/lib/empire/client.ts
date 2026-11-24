// Empire Builder client (empirebuilder.world). Empires are ERC-4337 SmartVault
// treasuries on Base with a create2 predictable address - "tokenless" means
// nothing is on-chain until first interaction, which is exactly the Sparkz thesis
// (spark now, token maybe later).
//
// This module covers the READ + resolve path (public GETs, no key). The tokenless
// DEPLOY path (POST /api/deploy-empire-tokenless) is mainnet-live and needs
// EMPIRE_API_KEY + an EIP-191 owner signature - see deployTokenless below, which
// is intentionally gated until the signer + key are configured.

const BASE = "https://www.empirebuilder.world/api";

export interface EmpireResolved {
  empireId: string; // baseToken: 0x..., fid..., c-..., or slug
  empireAddress: string | null; // SmartVault treasury (create2 predictable)
  tokenType: string | null;
  raw: unknown;
}

// GET /api/empires/[empire_id] - resolve an Empire ID to its SmartVault treasury.
export async function resolveEmpire(empireId: string): Promise<EmpireResolved | null> {
  const res = await fetch(`${BASE}/empires/${encodeURIComponent(empireId)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Empire resolve failed: ${res.status}`);
  return parseEmpire(empireId, await res.json());
}

// Empire Builder answers GET /empires/{id} as { empire: {...} } (checked live 2026-11-18 on
// sparkz6071a1). Reading the top level left empire_address and token_type empty, so a linked
// Hearth recorded no treasury. Read the nested object; the old flat shape still works.
export function parseEmpire(empireId: string, body: unknown): EmpireResolved {
  const top = (body ?? {}) as Record<string, unknown>;
  const data = (top.empire && typeof top.empire === "object" ? top.empire : top) as Record<string, unknown>;
  return {
    empireId: (data.base_token as string) || empireId,
    empireAddress:
      (data.empire_address as string) ??
      (data.empireAddress as string) ??
      (data.treasuryAddress as string) ??
      null,
    tokenType: (data.token_type as string) ?? null,
    raw: body,
  };
}

// --- Public read surface (no key). All verified live 2026-08-03 against empirebuilder.world. ---
// empireId accepts a base_token (0x...), fid<number>, or a custom slug.

async function getJson(path: string): Promise<unknown | null> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Empire GET ${path} failed: ${res.status}`);
  return res.json();
}

// GET /leaderboards?tokenAddress={empireId} - the empire's leaderboards (ids + meta).
export function listEmpireLeaderboards(empireId: string) {
  return getJson(`/leaderboards?tokenAddress=${encodeURIComponent(empireId)}`);
}

// GET /leaderboards/{leaderboardId} - a leaderboard's ranked entries (address, rank, points).
export function getLeaderboard(leaderboardId: string) {
  return getJson(`/leaderboards/${encodeURIComponent(leaderboardId)}`);
}

// GET /boosters/{empireId} - the empire's score-multiplier boosters.
export function getBoosters(empireId: string) {
  return getJson(`/boosters/${encodeURIComponent(empireId)}`);
}

// GET /empire-rewards/{empireId} - reward history (distribute / burned / airdrop totals).
export function getEmpireRewards(empireId: string) {
  return getJson(`/empire-rewards/${encodeURIComponent(empireId)}`);
}

// True when a name is one string typed twice ("WaveWarZ AfricaWaveWarZ Africa"), the
// mistake that happens when someone types over the name the launcher pre-fills.
export function isDoubledName(name: string): boolean {
  const n = name.trim();
  if (n.length < 6 || n.length % 2 !== 0) return false; // short names like "lala" are fine
  const half = n.length / 2;
  return n.slice(0, half).trim() !== "" && n.slice(0, half) === n.slice(half);
}

// The exact byte-exact message the tokenless deploy endpoint enforces (custom mode).
export function tokenlessCustomMessage(name: string): string {
  return `I am deploying a custom tokenless Empire named ${name.trim()}`;
}

export interface DeployTokenlessInput {
  owner: string; // the signer wallet (becomes empire owner)
  name: string;
  signature: `0x${string}`; // EIP-191 personal-sign of tokenlessCustomMessage(name)
  logoUri?: string;
  bio?: string;
  website_url?: string;
  twitter_url?: string;
  telegram_url?: string;
}

// POST /api/deploy-empire-tokenless (custom mode). MAINNET-LIVE on Base: creates a
// real empire (2 deploys/wallet/24h). Requires EMPIRE_API_KEY. The signature must
// be produced by `owner` over tokenlessCustomMessage(name).
export async function deployTokenlessCustom(
  input: DeployTokenlessInput,
): Promise<{ baseToken: string; raw: unknown }> {
  const apiKey = process.env.EMPIRE_API_KEY;
  if (!apiKey) {
    throw new Error("EMPIRE_API_KEY not set - tokenless deploy is disabled");
  }
  // No timeout on purpose: aborting here could not stop a deploy Empire had already started,
  // and the route would then release the claim for an empire that exists.
  const res = await fetch(`${BASE}/deploy-empire-tokenless`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      mode: "custom",
      owner: input.owner,
      name: input.name.trim(),
      signature: input.signature,
      message: tokenlessCustomMessage(input.name),
      logoUri: input.logoUri,
      bio: input.bio,
      website_url: input.website_url,
      twitter_url: input.twitter_url,
      telegram_url: input.telegram_url,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `deploy-empire-tokenless ${res.status}: ${(body as { error?: string }).error ?? "failed"}`,
    );
  }
  const data = (await res.json()) as { baseToken?: string };
  return { baseToken: data.baseToken ?? "", raw: data };
}

// --- Token launch path (Clanker v4 via Empire Builder). MAINNET-LIVE on Base. ---
// 1. getTokenConfig: Empire builds the Clanker v4 tokenConfig server-side (API key, no signature).
// 2. The owner's wallet deploys it with the Clanker SDK in the browser (pays gas, signs).
// 3. registerTokenEmpire: Empire checks the deploy tx and creates the empire treasury for the token.

export interface TokenConfigInput {
  name: string;
  symbol: string;
  imageUrl: string;
  creatorAddress: string;
  vaultPercentage?: number; // share of supply locked in the Clanker vault
  vaultDays?: number;
  feeType?: "static" | "dynamic";
  enableSniperFees?: boolean;
  tokenDescription?: string;
  socialTwitter?: string;
  socialFarcaster?: string;
  socialWebsite?: string;
  socialTelegram?: string;
}

// POST /api/get-token-config - returns { tokenConfig } for Clanker.deploy(). Requires EMPIRE_API_KEY.
export async function getTokenConfig(input: TokenConfigInput): Promise<{ tokenConfig: unknown; raw: unknown }> {
  const apiKey = process.env.EMPIRE_API_KEY;
  if (!apiKey) throw new Error("EMPIRE_API_KEY not set - token launch is disabled");
  const res = await fetch(`${BASE}/get-token-config`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ ...input, enableDevBuy: false, enableAirdrop: false }),
  });
  const data = (await res.json().catch(() => ({}))) as { tokenConfig?: unknown; error?: string };
  if (!res.ok || !data.tokenConfig) {
    throw new Error(`get-token-config ${res.status}: ${data.error ?? "failed"}`);
  }
  return { tokenConfig: data.tokenConfig, raw: data };
}

export interface RegisterTokenEmpireInput {
  baseToken: string; // the deployed token address
  name: string;
  owner: string; // the wallet that sent the deploy tx
  txHash: string;
  symbol: string;
  logoUri?: string;
  bio?: string;
  website_url?: string;
  twitter_url?: string;
  warpcast_url?: string;
  telegram_url?: string;
}

// POST /api/deploy-empire (Clanker fresh-deploy flow). Empire validates the tx receipt
// (owner = tx.from, LP rewards to the empire wallet, token address = baseToken).
// Never send tokenType. Rate limit: 2 empires per wallet per 24h.
export async function registerTokenEmpire(
  input: RegisterTokenEmpireInput,
): Promise<{ empireAddress: string | null; raw: unknown }> {
  const apiKey = process.env.EMPIRE_API_KEY;
  if (!apiKey) throw new Error("EMPIRE_API_KEY not set - token launch is disabled");
  const res = await fetch(`${BASE}/deploy-empire`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      baseToken: input.baseToken,
      name: input.name.trim(),
      owner: input.owner,
      txHash: input.txHash,
      chainId: 8453,
      clankerVersion: "clanker_v4",
      tokenInfo: { symbol: input.symbol, name: input.name.trim(), logoURI: input.logoUri },
      empireMetadata: {
        bio: input.bio,
        website_url: input.website_url,
        twitter_url: input.twitter_url,
        warpcast_url: input.warpcast_url,
        telegram_url: input.telegram_url,
      },
    }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`deploy-empire ${res.status}: ${(data.error as string) ?? "failed"}`);
  }
  return {
    empireAddress: (data.empireAddress as string) ?? (data.treasuryAddress as string) ?? null,
    raw: data,
  };
}

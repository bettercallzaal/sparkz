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
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Empire resolve failed: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  return {
    empireId,
    empireAddress:
      (data.empire_address as string) ??
      (data.empireAddress as string) ??
      (data.treasuryAddress as string) ??
      null,
    tokenType: (data.token_type as string) ?? null,
    raw: data,
  };
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

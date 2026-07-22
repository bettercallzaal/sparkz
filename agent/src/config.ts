// Agent config - loaded from env, validated once at startup. Fails fast with a
// clear message so a misconfigured agent never silently does nothing.

export type Autonomy = "propose" | "confidence" | "auto";

export interface Config {
  capsuleSlug: string;
  apiBase: string;
  adminToken: string;
  autonomy: Autonomy;
  confidenceThreshold: number; // 0..1, used when autonomy === "confidence"
  pollIntervalMs: number;
  dryRun: boolean;
  neynar: { apiKey: string; signerUuid: string } | null;
  discordWebhook: string | null;
}

function req(name: string, value: string | undefined): string {
  if (!value || !value.trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const autonomy = (env.AGENT_AUTONOMY ?? "propose") as Autonomy;
  if (!["propose", "confidence", "auto"].includes(autonomy)) {
    throw new Error(`AGENT_AUTONOMY must be propose|confidence|auto, got: ${autonomy}`);
  }

  const neynarKey = env.NEYNAR_API_KEY?.trim();
  const signer = env.NEYNAR_SIGNER_UUID?.trim();

  return {
    capsuleSlug: req("CAPSULE_SLUG", env.CAPSULE_SLUG),
    apiBase: (env.SPARKZ_API_BASE ?? "https://trysparkz.com").replace(/\/$/, ""),
    adminToken: req("SPARKZ_ADMIN_TOKEN", env.SPARKZ_ADMIN_TOKEN),
    autonomy,
    confidenceThreshold: Number(env.AGENT_CONFIDENCE_THRESHOLD ?? "0.75"),
    pollIntervalMs: Number(env.AGENT_POLL_INTERVAL_MS ?? "60000"),
    dryRun: (env.AGENT_DRY_RUN ?? "false").toLowerCase() === "true",
    neynar: neynarKey && signer ? { apiKey: neynarKey, signerUuid: signer } : null,
    discordWebhook: env.DISCORD_APPROVAL_WEBHOOK?.trim() || null,
  };
}

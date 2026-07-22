// Entrypoint. Loads config, wires the clients, and runs the Meme Engine loop on an
// interval. AGENT_ONCE=true runs a single tick and exits (good for cron / testing).

import { loadConfig } from "./config.js";
import { SparkzClient } from "./sparkz.js";
import { NeynarClient } from "./farcaster.js";
import { runOnce, type Logger } from "./engine.js";

const log: Logger = {
  info: (m) => console.log(new Date().toISOString(), m),
  warn: (m) => console.warn(new Date().toISOString(), "WARN", m),
};

async function main(): Promise<void> {
  const config = loadConfig();
  const sparkz = new SparkzClient(config.apiBase, config.adminToken);
  const farcaster = config.neynar
    ? new NeynarClient(config.neynar.apiKey, config.neynar.signerUuid)
    : null;
  const deps = { config, sparkz, farcaster, log };

  log.info(
    `Sparkz agent up - capsule=${config.capsuleSlug} autonomy=${config.autonomy} ` +
      `dryRun=${config.dryRun} cast=${farcaster ? "on" : "off"} api=${config.apiBase}`,
  );

  const tick = async () => {
    try {
      await runOnce(deps);
    } catch (err) {
      log.warn(`tick failed: ${(err as Error).message}`);
    }
  };

  await tick();
  if ((process.env.AGENT_ONCE ?? "false").toLowerCase() === "true") return;

  const timer = setInterval(tick, config.pollIntervalMs);
  const stop = () => {
    clearInterval(timer);
    log.info("shutting down");
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((err) => {
  console.error("fatal:", (err as Error).message);
  process.exit(1);
});

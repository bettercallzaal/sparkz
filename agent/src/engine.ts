// The Meme Engine loop, agent-side. Per tick: resolve the Capsule, find drafted
// signals awaiting action, pick the best draft, and let the autonomy gate decide -
// publish (approve + cast) or propose (notify a human, do nothing else).
//
// Human-in-the-loop is the default. The app already flags + drafts + writes receipts;
// the agent adds judgment (which draft), autonomy (when to act), and the one thing
// the app can't do server-side: cast to Farcaster.

import type { Autonomy, Config } from "./config.js";
import type { NeynarClient } from "./farcaster.js";
import { pickBest, type Scored } from "./score.js";
import { capsuleChannel, type Capsule, type Signal, type SparkzClient } from "./sparkz.js";

export type Decision = "publish" | "propose";

// Pure gate: given the autonomy tier and the winner's confidence, decide.
export function decide(autonomy: Autonomy, confidence: number, threshold: number): Decision {
  if (autonomy === "auto") return "publish";
  if (autonomy === "confidence") return confidence >= threshold ? "publish" : "propose";
  return "propose"; // "propose" tier: never acts on its own
}

export interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
}

export interface EngineDeps {
  config: Config;
  sparkz: SparkzClient;
  farcaster: NeynarClient | null;
  log: Logger;
}

export interface TickResult {
  capsule: string;
  considered: number;
  published: number;
  proposed: number;
  skipped: number;
}

export async function runOnce(deps: EngineDeps): Promise<TickResult> {
  const { config, sparkz, log } = deps;
  const capsule = await sparkz.getCapsuleBySlug(config.capsuleSlug);
  const signals = await sparkz.listSignals(capsule.id);
  const pending = signals.filter((s) => s.status === "drafted" && (s.drafts?.length ?? 0) > 0);

  const result: TickResult = {
    capsule: capsule.slug,
    considered: pending.length,
    published: 0,
    proposed: 0,
    skipped: 0,
  };

  if (!pending.length) {
    log.info(`[${capsule.slug}] no drafted signals awaiting action`);
    return result;
  }

  for (const signal of pending) {
    const outcome = await processSignal(deps, capsule, signal);
    if (outcome === "publish") result.published += 1;
    else if (outcome === "propose") result.proposed += 1;
    else result.skipped += 1;
  }

  log.info(
    `[${capsule.slug}] tick: ${result.published} published, ${result.proposed} proposed, ` +
      `${result.skipped} skipped of ${result.considered}`,
  );
  return result;
}

async function processSignal(
  deps: EngineDeps,
  capsule: Capsule,
  signal: Signal,
): Promise<Decision | "skip"> {
  const { config, sparkz, farcaster, log } = deps;
  const picked = pickBest(signal.drafts ?? [], capsule);
  if (!picked) {
    log.warn(`[${capsule.slug}] signal ${signal.id} has no scorable drafts, skipping`);
    return "skip";
  }

  const { best, confidence } = picked;
  const decision = decide(config.autonomy, confidence, config.confidenceThreshold);
  const preview = best.draft.draft_text.slice(0, 80).replace(/\n/g, " ");

  if (decision === "propose") {
    log.info(
      `[${capsule.slug}] PROPOSE (conf ${confidence.toFixed(2)}) signal ${signal.id}: "${preview}..."`,
    );
    await notify(deps, capsule, signal, best, confidence);
    return "propose";
  }

  // decision === "publish"
  if (config.dryRun) {
    log.info(`[${capsule.slug}] DRY-RUN would publish + cast: "${preview}..."`);
    return "publish";
  }

  await sparkz.approveDraft({
    signal_id: signal.id,
    draft_id: best.draft.id,
    approver: "agent",
    approved_via: "agent",
    lessons: `auto (${config.autonomy}, conf ${confidence.toFixed(2)}): ${best.reasons.join("; ")}`,
  });
  log.info(`[${capsule.slug}] approved draft ${best.draft.id} -> Meme Receipt`);

  const channel = capsuleChannel(capsule);
  if (farcaster) {
    try {
      const cast = await farcaster.publishCast(best.draft.draft_text, channel);
      log.info(`[${capsule.slug}] cast to ${channel ? "/" + channel : "home"}: ${cast.url || cast.hash}`);
    } catch (err) {
      log.warn(`[${capsule.slug}] receipt written but cast failed: ${(err as Error).message}`);
    }
  } else {
    log.warn(`[${capsule.slug}] receipt written; no Neynar signer configured, not cast`);
  }
  return "publish";
}

// Send a proposal to a human (Discord webhook if configured; always logs).
async function notify(
  deps: EngineDeps,
  capsule: Capsule,
  signal: Signal,
  best: Scored,
  confidence: number,
): Promise<void> {
  const { config } = deps;
  if (!config.discordWebhook) return;
  const approveUrl = `${config.apiBase}/admin?capsule=${capsule.id}&signal=${signal.id}`;
  const content =
    `**Sparkz agent proposal - ${capsule.name}** (confidence ${confidence.toFixed(2)})\n` +
    `> ${best.draft.draft_text}\n` +
    `Approve: ${approveUrl}`;
  try {
    await fetch(config.discordWebhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch {
    // best-effort; the console log already recorded the proposal
  }
}

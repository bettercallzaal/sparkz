// Draft scoring - a deterministic heuristic that ranks the 3 Capsule-grounded drafts
// and yields a confidence (0..1). Pure and testable: no network, no clock. This is
// the agent's judgment for the autonomy gate. It encodes the Sparkz persona rules:
// cast-length fit, no moon/token shilling, grounded in the Capsule.

import type { Capsule, Draft } from "./sparkz.js";

const CAST_MAX = 320; // Farcaster cast limit
const IDEAL_MIN = 60;
const IDEAL_MAX = 280;

// Anti-speculation: the persona never shills a token. These sink a draft's score.
const BANNED = [
  "moon",
  "100x",
  "1000x",
  "pump",
  "ape in",
  "buy now",
  "financial advice",
  "to the moon",
  "get rich",
  "presale",
];

export interface Scored {
  draft: Draft;
  score: number; // 0..1
  reasons: string[];
}

export function scoreDraft(draft: Draft, capsule: Capsule): Scored {
  const text = draft.draft_text.trim();
  const lower = text.toLowerCase();
  const reasons: string[] = [];
  let score = 0.5;

  // Length fit for a single cast.
  if (text.length === 0) {
    return { draft, score: 0, reasons: ["empty draft"] };
  }
  if (text.length > CAST_MAX) {
    score -= 0.4;
    reasons.push(`over cast limit (${text.length}/${CAST_MAX})`);
  } else if (text.length >= IDEAL_MIN && text.length <= IDEAL_MAX) {
    score += 0.2;
    reasons.push("good cast length");
  } else if (text.length < IDEAL_MIN) {
    score -= 0.1;
    reasons.push("very short");
  }

  // No token shilling / moon talk.
  const hits = BANNED.filter((b) => lower.includes(b));
  if (hits.length) {
    score -= 0.3 * hits.length;
    reasons.push(`speculation language: ${hits.join(", ")}`);
  } else {
    score += 0.1;
    reasons.push("no moon talk");
  }

  // Grounded in the Capsule (name or a distinctive word from it).
  const name = capsule.name.toLowerCase();
  if (name && lower.includes(name)) {
    score += 0.15;
    reasons.push("mentions the Capsule");
  }

  // Not shouting.
  const letters = text.replace(/[^a-z]/gi, "");
  const upper = text.replace(/[^A-Z]/g, "");
  if (letters.length > 12 && upper.length / letters.length > 0.6) {
    score -= 0.15;
    reasons.push("mostly uppercase");
  }

  // Hashtag spam.
  const tags = (text.match(/#/g) ?? []).length;
  if (tags > 2) {
    score -= 0.1;
    reasons.push("hashtag spam");
  }

  return { draft, score: clamp01(score), reasons };
}

// Pick the best draft. `confidence` is the winner's score, discounted when the
// top two are close (a near-tie means the agent is less sure it picked right).
export function pickBest(
  drafts: Draft[],
  capsule: Capsule,
): { best: Scored; confidence: number; ranked: Scored[] } | null {
  const ranked = drafts
    .map((d) => scoreDraft(d, capsule))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best) return null;
  const runnerUp = ranked[1]?.score ?? 0;
  const margin = best.score - runnerUp;
  // Confidence: the raw score, nudged down if the runner-up is within 0.1.
  const confidence = clamp01(best.score - (margin < 0.1 ? 0.1 - margin : 0));
  return { best, confidence, ranked };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

import type { Capsule, Signal } from "@/lib/supabase/types";

// The Meme Engine core: given a Capsule + a flagged signal, draft 3 Capsule-
// grounded responses. Uses the CHEAP model tier (OpenRouter) per CLAUDE.md -
// never a metered Claude path. If OPENROUTER_API_KEY is absent, falls back to
// 3 deterministic placeholder drafts so the loop is testable end-to-end before
// the key is set (each is clearly labelled as a fallback).

export const PROMPT_VERSION = "meme-draft-v1";

export interface GeneratedDraft {
  text: string;
  rank: number;
  model: string;
  promptVersion: string;
}

function buildPrompt(capsule: Capsule, signal: Signal): string {
  return [
    `You are the Meme Engine for "${capsule.name}", a ${capsule.type} Capsule on Sparkz.`,
    capsule.bio ? `Capsule bio: ${capsule.bio}` : "",
    `A cultural moment was flagged: "${signal.text}"`,
    signal.why_it_matched ? `Why it matches this Capsule: ${signal.why_it_matched}` : "",
    "",
    "Write 3 distinct short response options grounded in this Capsule's identity -",
    "punchy, postable, Farcaster-first. Number them 1-3. No preamble, no hash# spam.",
  ]
    .filter(Boolean)
    .join("\n");
}

function fallbackDrafts(capsule: Capsule, signal: Signal): GeneratedDraft[] {
  const base = signal.text.trim();
  const angles = [
    `${capsule.name}: ${base} - and here's why that's exactly our energy.`,
    `Hot take from ${capsule.name} on "${base}" - we've been saying this.`,
    `${base}? ${capsule.name} was built for this moment. Back the work.`,
  ];
  return angles.map((text, i) => ({
    text: `[fallback] ${text}`,
    rank: i + 1,
    model: "fallback",
    promptVersion: PROMPT_VERSION,
  }));
}

function splitIntoThree(raw: string): string[] {
  // Pull numbered items 1., 2., 3. if present; otherwise split on blank lines.
  const numbered = raw
    .split(/\n(?=\s*\d+[.)]\s)/)
    .map((s) => s.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
  const items = numbered.length >= 2 ? numbered : raw.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return items.slice(0, 3);
}

export async function generateDrafts(
  capsule: Capsule,
  signal: Signal,
): Promise<GeneratedDraft[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";

  if (!apiKey) return fallbackDrafts(capsule, signal);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: buildPrompt(capsule, signal) }],
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    if (!res.ok) return fallbackDrafts(capsule, signal);

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    const parts = splitIntoThree(content);
    if (parts.length === 0) return fallbackDrafts(capsule, signal);

    // Pad to 3 so the UI always shows three slots.
    while (parts.length < 3) parts.push(parts[parts.length - 1]);

    return parts.slice(0, 3).map((text, i) => ({
      text,
      rank: i + 1,
      model,
      promptVersion: PROMPT_VERSION,
    }));
  } catch {
    return fallbackDrafts(capsule, signal);
  }
}

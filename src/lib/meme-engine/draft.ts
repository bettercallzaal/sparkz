import { getServiceClient } from "@/lib/supabase/server";
import type { Capsule, Signal } from "@/lib/supabase/types";

// What this Capsule has learned: the drafts a human APPROVED (winners - match this
// voice) and the ones they PASSED ON with a reason (avoid these). This is the moat
// made real - draft quality compounds per-Capsule instead of every draft starting
// cold. Fallback-model drafts are excluded so placeholder text never trains the prompt.
export interface DraftMemory {
  winners: string[];
  passedOn: { text: string; reason: string }[];
}

const EMPTY_MEMORY: DraftMemory = { winners: [], passedOn: [] };

export async function fetchDraftMemory(capsuleId: string): Promise<DraftMemory> {
  try {
    const supabase = getServiceClient();
    const [won, passed] = await Promise.all([
      supabase
        .from("signal_drafts")
        .select("draft_text")
        .eq("capsule_id", capsuleId)
        .eq("chosen", true)
        .neq("model", "fallback")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("signal_drafts")
        .select("draft_text, reject_reason")
        .eq("capsule_id", capsuleId)
        .eq("chosen", false)
        .neq("model", "fallback")
        .not("reject_reason", "is", null)
        .order("created_at", { ascending: false })
        .limit(4),
    ]);
    // Memory is an enhancement - a fetch error must not block drafting. Log and
    // degrade to no-memory (still a good draft), never throw.
    if (won.error || passed.error) {
      console.warn(
        "[meme-engine] draft-memory fetch failed - drafting without memory.",
        won.error ?? passed.error,
      );
      return EMPTY_MEMORY;
    }
    return {
      winners: (won.data ?? []).map((r) => r.draft_text as string).filter(Boolean),
      passedOn: (passed.data ?? [])
        .map((r) => ({
          text: r.draft_text as string,
          reason: (r.reject_reason as string) ?? "",
        }))
        .filter((p) => p.text),
    };
  } catch (err) {
    console.warn("[meme-engine] draft-memory fetch threw - no memory.", err);
    return EMPTY_MEMORY;
  }
}

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

function buildPrompt(
  capsule: Capsule,
  signal: Signal,
  memory: DraftMemory = EMPTY_MEMORY,
): string {
  const winnersBlock = memory.winners.length
    ? [
        "",
        "Responses this Capsule APPROVED before (match this voice and energy - do NOT copy them):",
        ...memory.winners.map((w) => `- ${w}`),
      ]
    : [];
  const passedBlock = memory.passedOn.length
    ? [
        "",
        "Angles the human PASSED ON before (avoid these):",
        ...memory.passedOn.map((p) => `- "${p.text}"${p.reason ? ` (${p.reason})` : ""}`),
      ]
    : [];

  return [
    `You are the Meme Engine for "${capsule.name}", a ${capsule.type} Capsule on Sparkz.`,
    capsule.bio ? `Capsule bio: ${capsule.bio}` : "",
    `A cultural moment was flagged: "${signal.text}"`,
    signal.why_it_matched ? `Why it matches this Capsule: ${signal.why_it_matched}` : "",
    ...winnersBlock,
    ...passedBlock,
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

  // Ground the drafts in what this Capsule has already learned (approved + passed-on).
  const memory = await fetchDraftMemory(capsule.id);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: buildPrompt(capsule, signal, memory) }],
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(
        `[meme-engine] OpenRouter ${res.status} for model "${model}" - using fallback drafts. ${body.slice(0, 300)}`,
      );
      return fallbackDrafts(capsule, signal);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    const parts = splitIntoThree(content);
    if (parts.length === 0) {
      console.warn(
        `[meme-engine] OpenRouter returned no parseable drafts (content length ${content.length}) - using fallback.`,
      );
      return fallbackDrafts(capsule, signal);
    }

    // Pad to 3 so the UI always shows three slots.
    while (parts.length < 3) parts.push(parts[parts.length - 1]);

    return parts.slice(0, 3).map((text, i) => ({
      text,
      rank: i + 1,
      model,
      promptVersion: PROMPT_VERSION,
    }));
  } catch (err) {
    console.warn(
      `[meme-engine] OpenRouter request threw - using fallback drafts.`,
      err,
    );
    return fallbackDrafts(capsule, signal);
  }
}

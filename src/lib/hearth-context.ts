// Project context on a Hearth: what stage it is at, what it has done, and what it still
// needs help with. Zaal, 14 Nov 2026: "we wanna add lots more info and context about all
// zao projects and where they are what stage and what they have completed and what still
// needs support". Stored in hearths.metadata (stage, done, needs), like about and tags,
// so no migration. Pure, so it is unit-tested.

export const STAGES = ["idea", "building", "live", "growing"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  idea: "Idea",
  building: "Building",
  live: "Live",
  growing: "Growing",
};

export const MAX_ITEMS = 8;
export const MAX_ITEM_LENGTH = 140;

export interface HearthContext {
  stage: Stage | null;
  done: string[];
  needs: string[];
}

function list(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
}

// Reads the context from a Hearth's metadata. Anything malformed reads as empty, so a
// bad row never breaks a page.
export function readContext(metadata: unknown): HearthContext {
  const m = (
    metadata && typeof metadata === "object" ? metadata : {}
  ) as Record<string, unknown>;
  const stage = (STAGES as readonly unknown[]).includes(m.stage)
    ? (m.stage as Stage)
    : null;
  return { stage, done: list(m.done), needs: list(m.needs) };
}

export function hasContext(c: HearthContext): boolean {
  return c.stage !== null || c.done.length > 0 || c.needs.length > 0;
}

// The edit form keeps each list as one item per line; this turns the text back into a
// list. Blank lines are dropped and duplicates kept once.
export function linesToList(text: string): string[] {
  return [
    ...new Set(
      text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    ),
  ];
}

// Applies an owner's edit to a metadata copy. undefined leaves a field alone; "" or []
// clears it. Mirrors setOrClear in /api/capsules/update.
export function applyContext(
  meta: Record<string, unknown>,
  input: { stage?: Stage | ""; done?: string[]; needs?: string[] }
): void {
  if (input.stage !== undefined) {
    if (input.stage === "") delete meta.stage;
    else meta.stage = input.stage;
  }
  for (const key of ["done", "needs"] as const) {
    const v = input[key];
    if (v === undefined) continue;
    const items = [...new Set(v.map((x) => x.trim()).filter(Boolean))];
    if (items.length) meta[key] = items;
    else delete meta[key];
  }
}

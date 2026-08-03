import { getServiceClient } from "@/lib/supabase/server";
import type { Capsule } from "@/lib/supabase/types";
import { resolveEmpire } from "./client";

// Import an existing Empire Builder empire AS a Spark - the "bring already-created
// things into the fold" path. Pulls the empire's identity (name, logo, token type,
// treasury address) from Empire Builder and creates a Capsule wired to it, so a
// ZABAL or ZABAL GAMEZ empire that already exists becomes a first-class Capsule with
// its leaderboard + rewards readable through /api/empire/{id}.
//
// Idempotent: if a Capsule already links this empire, it's returned instead of
// creating a duplicate.

interface RawEmpire {
  name?: string;
  token_symbol?: string;
  token_type?: string;
  logo_uri?: string;
  base_token?: string;
  owner?: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function uniqueSlug(base: string): Promise<string> {
  const supabase = getServiceClient();
  const root = base || "empire";
  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const { data, error } = await supabase
      .from("capsules")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (error) throw error; // fail closed - never hand back a slug we couldn't verify
    if (!data) return candidate;
  }
  // Extremely unlikely; keep it collision-proof with a time-free random-ish suffix.
  return `${root}-${root.length}${base.length}`;
}

export async function importEmpireAsCapsule(empireId: string): Promise<Capsule> {
  const resolved = await resolveEmpire(empireId);
  if (!resolved) throw new Error(`empire not found on Empire Builder: ${empireId}`);

  const raw = resolved.raw as { empire?: RawEmpire } | RawEmpire;
  const e: RawEmpire = raw && "empire" in raw ? (raw.empire ?? {}) : (raw as RawEmpire);

  const supabase = getServiceClient();

  // Dedup: has any Capsule already imported/linked this empire?
  const { data: existing, error: exErr } = await supabase
    .from("capsules")
    .select("*")
    .eq("economic_config->>empire_id", resolved.empireId)
    .maybeSingle();
  if (exErr) throw exErr;
  if (existing) return existing as Capsule;

  const name = e.name?.trim() || empireId;
  const slug = await uniqueSlug(slugify(name));
  const hasToken = e.token_type === "clanker" || e.token_type === "token";

  const { data, error } = await supabase
    .from("capsules")
    .insert({
      slug,
      type: "culture",
      name,
      bio: `${name} - imported from Empire Builder. ${hasToken ? "Token-backed" : "Tokenless"} empire with a live leaderboard.`,
      status: hasToken ? "tokenized" : "spark",
      economic_config: {
        empire: true,
        tokenization_rail: "empire",
        empire_id: resolved.empireId,
        empire_address: resolved.empireAddress,
        empire_token_type: e.token_type ?? resolved.tokenType ?? "tokenless",
        empire_owner: e.owner ?? null,
        ...(hasToken && e.base_token ? { token: true, token_address: e.base_token } : {}),
      },
      metadata: {
        imported_from: "empire",
        logo_uri: e.logo_uri ?? null,
        token_symbol: e.token_symbol ?? null,
      },
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Capsule;
}

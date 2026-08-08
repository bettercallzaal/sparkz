import type { Hearth } from "@/lib/supabase/types";

// A Hearth's connected integrations, derived from what it already stores in
// economic_config + metadata. This is how you distinguish Sparks at a glance - which
// rails each one is wired to (Empire, a token, Farcaster, GitHub, a media kit). Pure
// function, safe to use server- or client-side.

export interface Connection {
  id: string;
  label: string;
}

type Json = Record<string, unknown>;

export function hearthConnections(
  hearth: Pick<Hearth, "type" | "economic_config" | "metadata">,
): Connection[] {
  const econ = (hearth.economic_config ?? {}) as Json;
  const meta = (hearth.metadata ?? {}) as Json;
  const out: Connection[] = [];

  if (econ.empire === true) out.push({ id: "empire", label: "Empire" });

  const isTokenized =
    econ.token === true ||
    typeof econ.token_address === "string" ||
    econ.empire_token_type === "clanker" ||
    econ.tokenization_rail === "clanker";
  if (isTokenized) out.push({ id: "token", label: "Token" });

  const fc = meta.farcaster as Json | undefined;
  if (fc && (fc.fid || fc.username || fc.channel)) {
    out.push({ id: "farcaster", label: "Farcaster" });
  }

  if (hearth.type === "oss" || meta.github || meta.repo) {
    out.push({ id: "github", label: "GitHub" });
  }

  if (econ.media_kit || meta.media_kit || meta.baraza) {
    out.push({ id: "media", label: "Media Kit" });
  }

  return out;
}

import { getServiceClient } from "@/lib/supabase/server";
import type { Hearth } from "@/lib/supabase/types";
import { type CulturalSignal, type SignalSource } from "./index";

// Farcaster SignalSource - the "curator, not author" upgrade. Instead of a human
// noticing a cultural moment and typing it in, this surfaces CANDIDATE moments from
// Farcaster (casts about the Hearth) so the operator reviews + flags the good ones.
// Read-only: needs a Neynar API key, NOT a signer (no posting). DARK until
// NEYNAR_API_KEY is set (same pattern as the Discord approval channel).
//
// detectSignals returns candidates - it does NOT persist them. The detect route
// hands them to the operator, who flags the winners via POST /api/signals.

interface NeynarCast {
  hash?: string;
  text?: string;
  author?: { username?: string; fid?: number };
  channel?: { id?: string } | null;
}

export class FarcasterSignalSource implements SignalSource {
  readonly id = "farcaster";

  async detectSignals(hearthId: string): Promise<CulturalSignal[]> {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) return []; // dark

    const supabase = getServiceClient();
    const { data: hearth, error } = await supabase
      .from("hearths")
      .select("*")
      .eq("id", hearthId)
      .maybeSingle();
    if (error) throw error;
    if (!hearth) return [];

    const meta = ((hearth as Hearth).metadata ?? {}) as {
      farcaster?: { username?: string | null; channel?: string | null };
    };
    // Search by the linked Farcaster username, else the Hearth name. Without a
    // handle there is nothing to look up, so bail cleanly.
    const query = meta.farcaster?.username || (hearth as Hearth).name;
    if (!query) return [];

    const url = new URL("https://api.neynar.com/v2/farcaster/cast/search");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "10");

    const res = await fetch(url, { headers: { "x-api-key": apiKey } });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(
        `[signal:farcaster] Neynar search ${res.status} for "${query}" - no candidates. ${body.slice(0, 200)}`,
      );
      return [];
    }

    const json = (await res.json().catch(() => null)) as
      | { result?: { casts?: NeynarCast[] } }
      | null;
    const casts = json?.result?.casts ?? [];

    return casts
      .filter((c) => c.text && c.hash)
      .map((c) => ({
        hearthId,
        text: c.text as string,
        source: this.id,
        sourceMeta: {
          hash: c.hash,
          author: c.author?.username ?? null,
          author_fid: c.author?.fid ?? null,
          channel: c.channel?.id ?? null,
          query,
        },
      }));
  }
}

// Singleton - registered into the seam by the built-in plugin.
export const farcasterSignalSource = new FarcasterSignalSource();

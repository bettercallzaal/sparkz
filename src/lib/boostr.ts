import { z } from "zod";

// Boostr (https://boostr.sahban.dev, by cashlessman.eth): a Farcaster mini app where people
// turn on ZAO auto-likes. Once on, Boostr likes casts that use the trigger words. Zaal,
// 19 Nov 2026: turning this on is the Zoostr Hearth's main ask, with live stats.
// Numbers are shown only when read live from Boostr's public API; never hard-coded.
export const BOOSTR_URL = "https://boostr.sahban.dev";
export const BOOSTR_STATS_URL = `${BOOSTR_URL}/api/zabal/stats`;
export const BOOSTR_TRIGGER_WORDS = ["zabal", "zao", "wavewarz", "sparkz", "zoostr"] as const;
// Hearths that show the auto-likes block.
export const BOOSTR_HEARTHS: ReadonlySet<string> = new Set(["zoostr"]);

const userSchema = z.object({
  fid: z.number(),
  username: z.string(),
  pfp_url: z.string().nullable().optional(),
  zabalLikesCount: z.number(),
});

const statsSchema = z.object({
  success: z.boolean().optional(),
  stats: z.object({
    totalCastsLiked: z.number(),
    activeContributorsCount: z.number(),
    totalLikesGenerated: z.number(),
    zabalUsers: z.array(userSchema),
  }),
});

export interface BoostrStats {
  totalCastsLiked: number;
  activeContributors: number;
  totalLikesGenerated: number;
  // The crew, ranked by likes given through Boostr: who showed up, not who is biggest.
  crew: { fid: number; username: string; pfp: string | null; likes: number }[];
}

// Parse Boostr's /api/zabal/stats body. Anything unexpected is null, so the page hides the
// numbers instead of showing a wrong or zero count.
export function parseBoostrStats(body: unknown, crewSize = 10): BoostrStats | null {
  const parsed = statsSchema.safeParse(body);
  if (!parsed.success) return null;
  const s = parsed.data.stats;
  const crew = [...s.zabalUsers]
    .filter((u) => u.zabalLikesCount > 0)
    .sort((a, b) => b.zabalLikesCount - a.zabalLikesCount)
    .slice(0, crewSize)
    .map((u) => ({ fid: u.fid, username: u.username, pfp: u.pfp_url ?? null, likes: u.zabalLikesCount }));
  return {
    totalCastsLiked: s.totalCastsLiked,
    activeContributors: s.activeContributorsCount,
    totalLikesGenerated: s.totalLikesGenerated,
    crew,
  };
}

// Server-side read, cached for 5 minutes by Next, 5-second timeout. Null on any failure.
export async function fetchBoostrStats(): Promise<BoostrStats | null> {
  try {
    const res = await fetch(BOOSTR_STATS_URL, {
      signal: AbortSignal.timeout(5_000),
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`[boostr] stats HTTP ${res.status}`);
      return null;
    }
    return parseBoostrStats(await res.json());
  } catch (err) {
    console.error("[boostr] stats read failed:", err);
    return null;
  }
}

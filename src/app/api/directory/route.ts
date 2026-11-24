import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { sessionClaims } from "@/lib/session";
import { blockedOwners } from "@/lib/blocks-server";
import { isBlockedHearth } from "@/lib/moderation";
import { ok, serverError } from "@/lib/http";
import { PUBLIC_REVIEW_FILTER } from "@/lib/sanitize";
import type { Hearth, HearthBacker, MemeReceipt } from "@/lib/supabase/types";
import { hearthConnections } from "@/lib/hearth-connections";

export const dynamic = "force-dynamic";

export interface DirectoryItem {
  id: string;
  slug: string;
  name: string;
  type: string;
  status: string;
  bio: string | null;
  backers: number;
  boosts: number;
  emails: number;
  receipts: number;
  empire: boolean;
  token: boolean;
  agent: boolean;
  farcaster: string | null;
  stars: number | null;
  contributors: number | null;
  newThisWeek: number; // backers + receipts added in the last 7 days (momentum)
  connections: { id: string; label: string }[]; // which integrations this Spark is wired to
  created_at: string;
}

// GET /api/directory - every Hearth with its live parameters (counts + integration
// flags) in one call, so the explorer can filter/sort client-side. Public read. Hearths
// owned by someone the viewer blocked are left out (migration 0009).
export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient();
    const [{ data: hearths }, { data: backers }, { data: receipts }, blocked] =
      await Promise.all([
        supabase
          .from("hearths")
          .select("*")
          .or(PUBLIC_REVIEW_FILTER)
          .order("created_at", { ascending: false }),
        supabase.from("hearth_backers").select("hearth_id, kind, backer_id, created_at"),
        supabase.from("meme_receipts").select("hearth_id, created_at"),
        blockedOwners(sessionClaims(req)),
      ]);

    const b =
      (backers as Pick<HearthBacker, "hearth_id" | "kind" | "backer_id" | "created_at">[]) ?? [];
    const r = (receipts as Pick<MemeReceipt, "hearth_id" | "created_at">[]) ?? [];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const visible = ((hearths as Hearth[]) ?? []).filter((c) => !isBlockedHearth(c, blocked));
    const items: DirectoryItem[] = visible.map((c) => {
      const mine = b.filter((x) => x.hearth_id === c.id);
      const econ = (c.economic_config ?? {}) as Record<string, unknown>;
      const meta = (c.metadata ?? {}) as Record<string, unknown>;
      const fc = meta.farcaster as
        | { fid?: number | null; username?: string | null; channel?: string | null }
        | undefined;
      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        type: c.type,
        status: c.status,
        bio: c.bio,
        backers: mine.length,
        boosts: mine.filter((x) => x.kind === "boost").length,
        emails: new Set(mine.filter((x) => x.backer_id.includes("@")).map((x) => x.backer_id))
          .size,
        receipts: r.filter((x) => x.hearth_id === c.id).length,
        newThisWeek:
          mine.filter((x) => x.created_at >= weekAgo).length +
          r.filter((x) => x.hearth_id === c.id && x.created_at >= weekAgo).length,
        empire: Boolean(econ.empire_address || econ.empire_id || econ.empire),
        token: Boolean(econ.token_address),
        agent: Boolean(econ.agent),
        connections: hearthConnections(c),
        farcaster: fc
          ? fc.channel
            ? `/${fc.channel}`
            : fc.username
              ? `@${fc.username}`
              : fc.fid
                ? `fid ${fc.fid}`
                : null
          : null,
        stars: typeof meta.stars === "number" ? meta.stars : null,
        contributors: Array.isArray(meta.contributors) ? meta.contributors.length : null,
        created_at: c.created_at,
      };
    });

    return ok(items);
  } catch (err) {
    return serverError(err, "directory.GET");
  }
}

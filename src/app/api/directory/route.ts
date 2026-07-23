import { getServiceClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/http";
import { PUBLIC_REVIEW_FILTER } from "@/lib/sanitize";
import type { Capsule, CapsuleBacker, MemeReceipt } from "@/lib/supabase/types";

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
  created_at: string;
}

// GET /api/directory - every Capsule with its live parameters (counts + integration
// flags) in one call, so the explorer can filter/sort client-side. Public read.
export async function GET() {
  try {
    const supabase = getServiceClient();
    const [{ data: capsules }, { data: backers }, { data: receipts }] =
      await Promise.all([
        supabase
          .from("capsules")
          .select("*")
          .or(PUBLIC_REVIEW_FILTER)
          .order("created_at", { ascending: false }),
        supabase.from("capsule_backers").select("capsule_id, kind, backer_id, created_at"),
        supabase.from("meme_receipts").select("capsule_id, created_at"),
      ]);

    const b =
      (backers as Pick<CapsuleBacker, "capsule_id" | "kind" | "backer_id" | "created_at">[]) ?? [];
    const r = (receipts as Pick<MemeReceipt, "capsule_id" | "created_at">[]) ?? [];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const items: DirectoryItem[] = ((capsules as Capsule[]) ?? []).map((c) => {
      const mine = b.filter((x) => x.capsule_id === c.id);
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
        receipts: r.filter((x) => x.capsule_id === c.id).length,
        newThisWeek:
          mine.filter((x) => x.created_at >= weekAgo).length +
          r.filter((x) => x.capsule_id === c.id && x.created_at >= weekAgo).length,
        empire: Boolean(econ.empire_address || econ.empire_id || econ.empire),
        token: Boolean(econ.token_address),
        agent: Boolean(econ.agent),
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

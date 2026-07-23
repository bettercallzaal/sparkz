import { getServiceClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/http";
import { PUBLIC_REVIEW_FILTER } from "@/lib/sanitize";
import type { Capsule, CapsuleBacker, MemeReceipt } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export interface ActivityEvent {
  kind: "spark" | "boost" | "receipt";
  slug: string;
  capsule: string;
  label: string;
  at: string;
}

export interface ActivityResponse {
  stats: { sparks: number; backers: number; receipts: number };
  events: ActivityEvent[];
}

// Show a supporter's handle only if it is a public @handle; email/fid backers are
// generalized so no PII (or raw identifier) ever reaches the feed.
function backerLabel(id: string): string {
  return id.startsWith("@") ? id : "a supporter";
}

// GET /api/activity - a proof-of-life feed: recent sparks, boosts, and receipts
// across public Capsules, plus headline counts. Value, not price - no numbers a
// speculator would trade on. Only approved/unreviewed Capsules are included, and
// backer identities are sanitized.
export async function GET() {
  try {
    const supabase = getServiceClient();

    const { data: capsuleRows } = await supabase
      .from("capsules")
      .select("id, name, slug, created_at")
      .or(PUBLIC_REVIEW_FILTER)
      .order("created_at", { ascending: false });
    const capsules = (capsuleRows as Pick<Capsule, "id" | "name" | "slug" | "created_at">[]) ?? [];
    const byId = new Map(capsules.map((c) => [c.id, c]));
    const publicIds = new Set(capsules.map((c) => c.id));

    const [{ data: backerRows }, { data: receiptRows }] = await Promise.all([
      supabase
        .from("capsule_backers")
        .select("capsule_id, backer_id, kind, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("meme_receipts")
        .select("capsule_id, reach, published_at, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const events: ActivityEvent[] = [];

    for (const b of (backerRows as CapsuleBacker[]) ?? []) {
      const c = byId.get(b.capsule_id);
      if (!c) continue; // not public
      events.push({
        kind: "boost",
        slug: c.slug,
        capsule: c.name,
        label: `${backerLabel(b.backer_id)} backed ${c.name}`,
        at: b.created_at,
      });
    }

    for (const r of (receiptRows as MemeReceipt[]) ?? []) {
      const c = byId.get(r.capsule_id);
      if (!c) continue;
      const reach = r.reach && r.reach > 0 ? ` (reach ${r.reach})` : "";
      events.push({
        kind: "receipt",
        slug: c.slug,
        capsule: c.name,
        label: `${c.name} published a Meme Receipt${reach}`,
        at: r.published_at ?? r.created_at,
      });
    }

    for (const c of capsules.slice(0, 6)) {
      events.push({
        kind: "spark",
        slug: c.slug,
        capsule: c.name,
        label: `${c.name} sparked`,
        at: c.created_at,
      });
    }

    events.sort((a, b) => b.at.localeCompare(a.at));

    // Distinct public backers for the headline count.
    const backerIds = new Set(
      ((backerRows as CapsuleBacker[]) ?? [])
        .filter((b) => publicIds.has(b.capsule_id))
        .map((b) => b.backer_id),
    );

    const { count: receiptCount } = await supabase
      .from("meme_receipts")
      .select("id", { count: "exact", head: true });

    const res: ActivityResponse = {
      stats: {
        sparks: capsules.length,
        backers: backerIds.size,
        receipts: receiptCount ?? 0,
      },
      events: events.slice(0, 8),
    };
    return ok(res);
  } catch (err) {
    return serverError(err, "activity.GET");
  }
}

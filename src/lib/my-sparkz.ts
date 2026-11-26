// My Hearths and My Sparkz, the two middle tabs of the iPhone app's bottom bar.
// Pure, so they are unit-tested; /api/me/hearths and /api/me/sparkz read the rows and
// apply these.
//
// My Hearths: the Hearths the signed-in person owns (hearths.owner_fid, or owner_wallet
// for a wallet session) or contributes to (a hearth_backers row keyed by them: a boost, a
// backing or a collectable; or a team_signups row with their wallet).
//
// My Sparkz (Zaal, 25 Nov 2026: "the sparkz someone owns in what hearth they lie in"):
// the Sparks the person started or holds, each with the Hearth it lives in:
//   - a Spark row they created (sparks.created_by_fid): a moment, token, NFT, bounty or event;
//   - a poidh bounty on a Hearth they own (hearth_bounties; POST /api/hearth-bounties
//     records one only after the owner's own wallet created it);
//   - the token Spark of a Hearth they own (hearths.metadata.spark, lib/token-spark.ts);
//   - a boost they gave (hearth_backers kind 'boost').
// Word note: the code sometimes calls a whole Hearth a "spark" (hearths.status 'spark',
// YourSparks.tsx). Here a Spark is always a thing that lives on a Hearth.

import { readTokenSpark } from "@/lib/token-spark";
import { poidhUrlId } from "@/lib/poidh/abi";

export type HearthRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  status: string;
  metadata?: unknown;
  created_at?: string;
};

export type HearthRef = { slug: string; name: string; href: string };

// ---------- My Hearths ----------

export type MyHearthRole = "owner" | "backer" | "team";

export type MyHearth = {
  slug: string;
  name: string;
  type: string;
  status: string;
  review: string | null;
  roles: MyHearthRole[];
  last_at: string;
};

function review(metadata: unknown): string | null {
  const r = (metadata as { review?: unknown } | null | undefined)?.review;
  return typeof r === "string" ? r : null;
}

/**
 * Owned Hearths first (newest first), then the ones they contribute to (most recent
 * contribution first). `hearths` holds every Hearth row the route could read; a
 * contribution whose Hearth is missing (not public, or deleted) is dropped.
 */
export function assembleMyHearths(input: {
  owned: HearthRow[];
  backings: { hearth_id: string; created_at: string }[];
  team: { hearth_id: string; created_at: string }[];
  hearths: HearthRow[];
}): MyHearth[] {
  const byId = new Map(input.hearths.map((h) => [h.id, h]));
  for (const h of input.owned) byId.set(h.id, h);
  const out = new Map<string, MyHearth>();

  const add = (id: string, role: MyHearthRole, at: string) => {
    const h = byId.get(id);
    if (!h) return;
    const cur = out.get(id);
    if (!cur) {
      out.set(id, { slug: h.slug, name: h.name, type: h.type, status: h.status, review: review(h.metadata), roles: [role], last_at: at });
      return;
    }
    if (!cur.roles.includes(role)) cur.roles.push(role);
    if (at > cur.last_at) cur.last_at = at;
  };

  for (const h of input.owned) add(h.id, "owner", h.created_at ?? "");
  for (const b of input.backings) add(b.hearth_id, "backer", b.created_at);
  for (const t of input.team) add(t.hearth_id, "team", t.created_at);

  const all = [...out.values()];
  const owner = all.filter((h) => h.roles.includes("owner"));
  const rest = all.filter((h) => !h.roles.includes("owner"));
  const newest = (a: MyHearth, b: MyHearth) => (a.last_at < b.last_at ? 1 : a.last_at > b.last_at ? -1 : 0);
  return [...owner.sort(newest), ...rest.sort(newest)];
}

// ---------- My Sparkz ----------

export type MySparkKind = "moment" | "token" | "nft" | "bounty" | "event" | "boost";
export type MySparkRole = "started" | "posted" | "launched" | "boosted";

export type MySpark = {
  key: string;
  kind: MySparkKind;
  role: MySparkRole;
  title: string;
  hearth: HearthRef;
  at: string;
};

const SPARK_KINDS = new Set(["moment", "token", "nft", "bounty", "event"]);

function ref(h: HearthRow): HearthRef {
  return { slug: h.slug, name: h.name, href: `/c/${h.slug}` };
}

/** Every Spark the person owns, newest first, each with its Hearth. */
export function assembleMySparkz(input: {
  owned: HearthRow[];
  sparks: { id: string; hearth_id: string; kind: string; title: string; status?: string; created_at: string }[];
  bounties: { id: string; hearth_id: string; bounty_id: string | number; created_at: string }[];
  boosts: { hearth_id: string; created_at: string }[];
  hearths: HearthRow[];
}): MySpark[] {
  const byId = new Map(input.hearths.map((h) => [h.id, h]));
  for (const h of input.owned) byId.set(h.id, h);
  const out: MySpark[] = [];

  for (const s of input.sparks) {
    const h = byId.get(s.hearth_id);
    if (!h || !SPARK_KINDS.has(s.kind)) continue;
    out.push({ key: `spark:${s.id}`, kind: s.kind as MySparkKind, role: "started", title: s.title, hearth: ref(h), at: s.created_at });
  }

  const seenBounty = new Set<string>();
  for (const b of input.bounties) {
    const h = byId.get(b.hearth_id);
    if (!h || seenBounty.has(b.id)) continue;
    seenBounty.add(b.id);
    out.push({ key: `bounty:${b.id}`, kind: "bounty", role: "posted", title: `poidh bounty #${poidhUrlId(b.bounty_id)}`, hearth: ref(h), at: b.created_at });
  }

  for (const h of input.owned) {
    if (!readTokenSpark(h.slug, h.metadata)) continue;
    out.push({ key: `token:${h.id}`, kind: "token", role: "launched", title: `${h.name} token`, hearth: ref(h), at: h.created_at ?? "" });
  }

  // One boost per Hearth (the boost unique index, migration 0007); keep the newest.
  const boosted = new Map<string, string>();
  for (const b of input.boosts) {
    const cur = boosted.get(b.hearth_id);
    if (!cur || b.created_at > cur) boosted.set(b.hearth_id, b.created_at);
  }
  for (const [id, at] of boosted) {
    const h = byId.get(id);
    if (!h) continue;
    out.push({ key: `boost:${id}`, kind: "boost", role: "boosted", title: `You boosted ${h.name}`, hearth: ref(h), at });
  }

  return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}

// Group a backer's rows into one entry per Hearth, newest first: which kinds of
// backing they gave (boost, backing, collectable) and when they last did. Pure, so it
// is unit-tested; /api/me/backings applies it.
export interface BackingRow {
  hearth_id: string;
  kind: string;
  created_at: string;
}

export interface BackedHearth {
  hearth_id: string;
  kinds: string[];
  last_at: string;
}

export function groupBackings(rows: BackingRow[]): BackedHearth[] {
  const by = new Map<string, BackedHearth>();
  for (const r of rows) {
    const cur = by.get(r.hearth_id);
    if (!cur) {
      by.set(r.hearth_id, { hearth_id: r.hearth_id, kinds: [r.kind], last_at: r.created_at });
      continue;
    }
    if (!cur.kinds.includes(r.kind)) cur.kinds.push(r.kind);
    if (r.created_at > cur.last_at) cur.last_at = r.created_at;
  }
  return [...by.values()].sort((a, b) => (a.last_at < b.last_at ? 1 : a.last_at > b.last_at ? -1 : 0));
}

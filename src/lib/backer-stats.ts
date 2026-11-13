// Totals for an owner's Backers view: distinct backers, boosts, and backings in the
// last 7 days. Pure, so it is unit-tested; /api/capsules/backers-owner applies it.
export interface StatRow {
  backer_id: string;
  kind: string;
  created_at: string;
}

export function backerStats(rows: StatRow[], now: number = Date.now()) {
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  return {
    backers: new Set(rows.map((r) => r.backer_id)).size,
    boosts: rows.filter((r) => r.kind === "boost").length,
    lastWeek: rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
  };
}

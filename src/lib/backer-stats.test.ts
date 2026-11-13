import { test } from "node:test";
import assert from "node:assert/strict";
import { backerStats } from "./backer-stats";

const now = Date.parse("2026-11-13T00:00:00Z");

test("counts distinct backers, boosts and the last 7 days", () => {
  const s = backerStats(
    [
      { backer_id: "fid:1", kind: "boost", created_at: "2026-11-12T00:00:00Z" },
      { backer_id: "fid:1", kind: "backing", created_at: "2026-11-01T00:00:00Z" },
      { backer_id: "a@b.co", kind: "boost", created_at: "2026-11-07T00:00:00Z" },
    ],
    now,
  );
  assert.deepEqual(s, { backers: 2, boosts: 2, lastWeek: 2 });
});

test("empty is all zeros", () => {
  assert.deepEqual(backerStats([], now), { backers: 0, boosts: 0, lastWeek: 0 });
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBoostrStats } from "./boostr";

const body = {
  success: true,
  stats: {
    totalCastsLiked: 383,
    activeContributorsCount: 76,
    allTimeContributorsCount: 94,
    totalLikesGenerated: 22554,
    zabalUsers: [
      { fid: 1, username: "big", followers_count: 90000, pfp_url: "https://x/a.png", zabalLikesCount: 2, zabalEnabled: true },
      { fid: 2, username: "regular", followers_count: 40, pfp_url: null, zabalLikesCount: 50, zabalEnabled: true },
      { fid: 3, username: "idle", followers_count: 10, pfp_url: null, zabalLikesCount: 0, zabalEnabled: false },
    ],
  },
};

test("the crew is ranked by likes given, not followers, and idle members are left out", () => {
  const s = parseBoostrStats(body);
  assert.ok(s);
  assert.deepEqual(s.crew.map((c) => c.username), ["regular", "big"]);
  assert.equal(s.totalLikesGenerated, 22554);
  assert.equal(s.activeContributors, 76);
});

test("an unexpected body is null, so the page hides numbers instead of showing 0", () => {
  assert.equal(parseBoostrStats(null), null);
  assert.equal(parseBoostrStats({ success: false }), null);
  assert.equal(parseBoostrStats({ stats: { totalCastsLiked: "many" } }), null);
  // A valid stats body with success false, or with no success flag, is not shown.
  assert.equal(parseBoostrStats({ ...body, success: false }), null);
  const { success: _drop, ...noFlag } = body;
  void _drop;
  assert.equal(parseBoostrStats(noFlag), null);
});

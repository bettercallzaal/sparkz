import { test } from "node:test";
import assert from "node:assert/strict";
import { assembleMyHearths, assembleMySparkz, type HearthRow } from "./my-sparkz";

const A: HearthRow = { id: "a", slug: "alpha", name: "Alpha", type: "creator", status: "spark", created_at: "2026-11-01" };
const B: HearthRow = { id: "b", slug: "beta", name: "Beta", type: "oss", status: "spark", created_at: "2026-11-02" };
const ZABAL: HearthRow = { id: "z", slug: "zabal", name: "ZABAL", type: "culture", status: "tokenized", created_at: "2026-10-01" };

test("My Hearths: owned first, then contributed, roles merged per Hearth", () => {
  const out = assembleMyHearths({
    owned: [A],
    backings: [
      { hearth_id: "b", created_at: "2026-11-10" },
      { hearth_id: "a", created_at: "2026-11-11" },
    ],
    team: [{ hearth_id: "b", created_at: "2026-11-12" }],
    hearths: [B],
  });
  assert.deepEqual(out.map((h) => [h.slug, h.roles]), [
    ["alpha", ["owner", "backer"]],
    ["beta", ["backer", "team"]],
  ]);
});

test("red control: a contribution to a Hearth that is not public is dropped", () => {
  const out = assembleMyHearths({ owned: [], backings: [{ hearth_id: "hidden", created_at: "2026-11-10" }], team: [], hearths: [] });
  assert.deepEqual(out, []);
});

test("My Sparkz: each Spark comes with the Hearth it lives in, newest first", () => {
  const out = assembleMySparkz({
    owned: [A, ZABAL],
    sparks: [{ id: "s1", hearth_id: "a", kind: "event", title: "Launch night", created_at: "2026-11-20" }],
    bounties: [{ id: "hb1", hearth_id: "a", bounty_id: 42, created_at: "2026-11-21" }],
    boosts: [{ hearth_id: "b", created_at: "2026-11-22" }],
    hearths: [B],
  });
  assert.deepEqual(
    out.map((s) => [s.kind, s.role, s.title, s.hearth.name, s.hearth.href]),
    [
      ["boost", "boosted", "You boosted Beta", "Beta", "/c/beta"],
      // on-chain id 42 is poidh.xyz bounty #1028 (42 + 986): the label uses the poidh URL id.
      ["bounty", "posted", "poidh bounty #1028", "Alpha", "/c/alpha"],
      ["event", "started", "Launch night", "Alpha", "/c/alpha"],
      ["token", "launched", "ZABAL token", "ZABAL", "/c/zabal"],
    ],
  );
});

test("red control: a Hearth the person owns is not itself a Spark (the code's old 'spark' word)", () => {
  // Alpha has hearths.status 'spark' and no token Spark: it must not show as a Spark.
  const out = assembleMySparkz({ owned: [A], sparks: [], bounties: [], boosts: [], hearths: [] });
  assert.deepEqual(out, []);
});

test("red control: a Spark or boost on a Hearth that is not public is dropped", () => {
  const out = assembleMySparkz({
    owned: [],
    sparks: [{ id: "s1", hearth_id: "hidden", kind: "moment", title: "x", created_at: "2026-11-20" }],
    bounties: [],
    boosts: [{ hearth_id: "hidden", created_at: "2026-11-20" }],
    hearths: [],
  });
  assert.deepEqual(out, []);
});

test("one boost entry per Hearth", () => {
  const out = assembleMySparkz({
    owned: [],
    sparks: [],
    bounties: [],
    boosts: [
      { hearth_id: "b", created_at: "2026-11-01" },
      { hearth_id: "b", created_at: "2026-11-05" },
    ],
    hearths: [B],
  });
  assert.equal(out.length, 1);
  assert.equal(out[0].at, "2026-11-05");
});

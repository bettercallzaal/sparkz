import { test } from "node:test";
import assert from "node:assert/strict";
import { boosterId, viewerBoosted, boostOutcome } from "./boost-state";

const ADDR = "0x" + "ab".repeat(20);
const fidSession = { fid: 42, address: null };
const walletSession = { fid: null, address: ADDR };

test("already boosted: a fid session sees the boosted state on load", () => {
  assert.equal(viewerBoosted([{ kind: "boost", backer_id: "fid:42" }], fidSession), true);
});

test("already boosted: a wallet session sees the boosted state on load", () => {
  assert.equal(viewerBoosted([{ kind: "boost", backer_id: ADDR }], walletSession), true);
});

test("not boosted: other people's boosts and non-boost backings do not count", () => {
  const rows = [
    { kind: "boost", backer_id: "fid:7" },
    { kind: "tip", backer_id: "fid:42" },
  ];
  assert.equal(viewerBoosted(rows, fidSession), false);
});

test("signed out is never boosted and has no booster id", () => {
  assert.equal(boosterId(null), null);
  assert.equal(viewerBoosted([{ kind: "boost", backer_id: "fid:42" }], null), false);
});

test("a successful boost switches to the boosted state", () => {
  const out = boostOutcome(201, { ok: true, data: {} });
  assert.equal(out.next, "done");
});

test("a duplicate press gets feedback and the boosted state, not silence", () => {
  for (const out of [boostOutcome(200, { ok: true, data: { deduped: true } }), boostOutcome(409, { ok: false })]) {
    assert.equal(out.next, "done");
    assert.match((out as { message: string }).message, /already boosted/);
  }
});

test("signed out (401) still asks to sign in; other failures show the error", () => {
  assert.deepEqual(boostOutcome(401, { ok: false, error: "Sign in to boost" }), { next: "signin" });
  assert.deepEqual(boostOutcome(500, { ok: false, error: "boom" }), { next: "error", message: "boom" });
});

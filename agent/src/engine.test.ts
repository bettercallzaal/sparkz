// Tests for the agent's pure judgment: the draft scorer and the autonomy gate.
// Run: npm test  (node --test via tsx)

import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreDraft, pickBest } from "./score.js";
import { decide } from "./engine.js";
import type { Capsule, Draft } from "./sparkz.js";

const capsule = { name: "Zoostr" } as Capsule;
const draft = (id: string, text: string): Draft => ({
  id,
  signal_id: "s1",
  draft_text: text,
  rank: 1,
  chosen: false,
});

test("scoreDraft rewards a clean, well-sized, grounded cast", () => {
  const s = scoreDraft(
    draft("a", "Zoostr just packed a surprise midnight set - the room felt it. Back the work."),
    capsule,
  );
  assert.ok(s.score > 0.7, `expected high score, got ${s.score}`);
  assert.ok(s.reasons.includes("mentions the Capsule"));
});

test("scoreDraft sinks moon talk / token shilling", () => {
  const s = scoreDraft(draft("b", "Zoostr token to the moon, 100x, ape in and buy now!"), capsule);
  assert.ok(s.score < 0.4, `expected low score, got ${s.score}`);
});

test("scoreDraft penalizes over-cast-limit length", () => {
  const s = scoreDraft(draft("c", "x".repeat(400)), capsule);
  assert.ok(s.reasons.some((r) => r.includes("over cast limit")));
  assert.ok(s.score < 0.4);
});

test("scoreDraft gives an empty draft a zero", () => {
  assert.equal(scoreDraft(draft("d", "   "), capsule).score, 0);
});

test("pickBest returns the strongest draft", () => {
  const picked = pickBest(
    [
      draft("a", "buy now, moon, 100x, presale!!!"),
      draft("b", "Zoostr surprised the room with a midnight set. That is the spark - back the work."),
      draft("c", "OK"),
    ],
    capsule,
  );
  assert.ok(picked);
  assert.equal(picked!.best.draft.id, "b");
});

test("pickBest discounts confidence on a near-tie", () => {
  const near = pickBest(
    [draft("a", "Zoostr lit up the room tonight, back the work"), draft("b", "Zoostr lit up the room tonight, back the art")],
    capsule,
  )!;
  const clear = pickBest(
    [draft("a", "Zoostr lit up the room tonight, back the work"), draft("b", "moon 100x buy now presale")],
    capsule,
  )!;
  assert.ok(near.confidence <= clear.confidence);
});

test("decide: propose tier never publishes", () => {
  assert.equal(decide("propose", 0.99, 0.5), "propose");
});

test("decide: auto tier always publishes", () => {
  assert.equal(decide("auto", 0.01, 0.5), "publish");
});

test("decide: confidence tier respects the threshold", () => {
  assert.equal(decide("confidence", 0.8, 0.75), "publish");
  assert.equal(decide("confidence", 0.7, 0.75), "propose");
});

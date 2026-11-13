import { test } from "node:test";
import assert from "node:assert/strict";
import { sleepTransition } from "./hearth-sleep";

test("sleeping a spark remembers it and goes dormant", () => {
  assert.deepEqual(sleepTransition("spark", { a: 1 }, true), {
    status: "dormant",
    metadata: { a: 1, previous_status: "spark" },
  });
});

test("waking restores a tokenized Hearth as tokenized, and clears the memory", () => {
  assert.deepEqual(sleepTransition("dormant", { previous_status: "tokenized", a: 1 }, false), {
    status: "tokenized",
    metadata: { a: 1 },
  });
});

test("waking with no memory, or a strange one, comes back as a spark", () => {
  assert.equal(sleepTransition("dormant", {}, false)?.status, "spark");
  assert.equal(sleepTransition("dormant", { previous_status: "dormant" }, false)?.status, "spark");
});

test("no-ops return null", () => {
  assert.equal(sleepTransition("dormant", {}, true), null);
  assert.equal(sleepTransition("spark", {}, false), null);
});

test("the input metadata is not mutated", () => {
  const m = { a: 1 };
  sleepTransition("spark", m, true);
  assert.deepEqual(m, { a: 1 });
});

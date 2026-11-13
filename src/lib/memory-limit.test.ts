import { test } from "node:test";
import assert from "node:assert/strict";
import { memoryLimitHit, resetMemoryLimits } from "./memory-limit";

test("the limit refuses the call after `limit` hits and lets it through once the window passes", () => {
  resetMemoryLimits();
  const t0 = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(memoryLimitHit("a", 3, 1000, t0 + i), false);
  assert.equal(memoryLimitHit("a", 3, 1000, t0 + 10), true, "fourth call inside the window is refused");
  assert.equal(memoryLimitHit("a", 3, 1000, t0 + 20), true, "a refused call is not counted, so it stays refused");
  assert.equal(memoryLimitHit("b", 3, 1000, t0 + 20), false, "another key has its own window");
  assert.equal(memoryLimitHit("a", 3, 1000, t0 + 1001), false, "the first hit has aged out");
});

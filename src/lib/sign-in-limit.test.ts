import { test } from "node:test";
import assert from "node:assert/strict";
import { memoryLimitHit, resetMemoryLimits, SIGN_IN_LIMIT, SIGN_IN_WINDOW_MS } from "./memory-limit";

test("sign-in allows SIGN_IN_LIMIT attempts per window, then refuses, then recovers", () => {
  resetMemoryLimits();
  const t0 = 1_000_000;
  for (let i = 0; i < SIGN_IN_LIMIT; i++) assert.equal(memoryLimitHit("auth:ip-a", SIGN_IN_LIMIT, SIGN_IN_WINDOW_MS, t0 + i), false);
  assert.equal(memoryLimitHit("auth:ip-a", SIGN_IN_LIMIT, SIGN_IN_WINDOW_MS, t0 + SIGN_IN_LIMIT), true);
  assert.equal(memoryLimitHit("auth:ip-b", SIGN_IN_LIMIT, SIGN_IN_WINDOW_MS, t0 + SIGN_IN_LIMIT), false, "another IP is unaffected");
  assert.equal(memoryLimitHit("auth:ip-a", SIGN_IN_LIMIT, SIGN_IN_WINDOW_MS, t0 + SIGN_IN_WINDOW_MS + SIGN_IN_LIMIT + 1), false, "the window slides");
  resetMemoryLimits();
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// hats/status once destructured Promise.all as [supply, worn, canMint] over
// [hatSupply, hatsClaimable, isWearer], so canMint held "already wears it" and the mint
// button (FirstHat.tsx, disabled on !canMint) was off for everyone without the hat.
// The calls hit the chain, so this pins the pairing in the source instead.
test("hats/status pairs canMint with hatsClaimable and worn with isWearer", () => {
  const src = readFileSync(new URL("../app/api/hats/status/route.ts", import.meta.url), "utf8");
  const m = src.match(/const \[(\w+), (\w+), (\w+)\] = await Promise\.all\(\[([\s\S]*?)\]\);/);
  assert.ok(m, "Promise.all destructure not found");
  const names = [m[1], m[2], m[3]];
  const calls = [...m[4].matchAll(/\b(hatSupply|hatsClaimable|isWearer)\(/g)].map((x) => x[1]);
  assert.deepEqual(calls, ["hatSupply", "hatsClaimable", "isWearer"]);
  assert.deepEqual(names, ["supply", "canMint", "worn"]);
});

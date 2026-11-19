import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEmpire } from "./client";

// The live answer for the Sparkz empire (trimmed), 2026-11-18.
const live = {
  empire: {
    base_token: "sparkz6071a1",
    name: "Sparkz",
    token_type: "tokenless",
    empire_address: "0x5db616ac2ee0600d215ef3847df20c76ec045dbe",
  },
};

test("reads the treasury and type from the nested empire object", () => {
  const r = parseEmpire("sparkz6071a1", live);
  assert.equal(r.empireAddress, "0x5db616ac2ee0600d215ef3847df20c76ec045dbe");
  assert.equal(r.tokenType, "tokenless");
  assert.equal(r.empireId, "sparkz6071a1");
});

test("still reads the old flat shape", () => {
  const r = parseEmpire("fid1", { empire_address: "0xabc", token_type: "farcaster_tokenless" });
  assert.equal(r.empireAddress, "0xabc");
  assert.equal(r.tokenType, "farcaster_tokenless");
});

test("an empty answer gives nulls, not a crash", () => {
  const r = parseEmpire("x", null);
  assert.equal(r.empireAddress, null);
  assert.equal(r.tokenType, null);
  assert.equal(r.empireId, "x");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { recordBountySchema, createBountyFormSchema } from "./schemas";

const HASH = "0x" + "ab".repeat(32);
const HEARTH = "11111111-1111-4111-8111-111111111111";

test("record body needs a uuid and a 32-byte hash", () => {
  assert.equal(recordBountySchema.safeParse({ hearth_id: HEARTH, tx_hash: HASH }).success, true);
  assert.equal(recordBountySchema.safeParse({ hearth_id: HEARTH, tx_hash: "0x12" }).success, false);
  assert.equal(recordBountySchema.safeParse({ hearth_id: "nope", tx_hash: HASH }).success, false);
  assert.equal(recordBountySchema.safeParse({ hearth_id: HEARTH, tx_hash: "0x" + "zz".repeat(32) }).success, false);
});

test("form reward floor is 0.001 ETH", () => {
  const base = { name: "Zoostr logo", description: "Draw the Zoostr logo please." };
  assert.equal(createBountyFormSchema.safeParse({ ...base, reward_wei: "999999999999999" }).success, false);
  assert.equal(createBountyFormSchema.safeParse({ ...base, reward_wei: "6000000000000000" }).success, true);
  assert.equal(createBountyFormSchema.safeParse({ ...base, reward_wei: "0.006" }).success, false);
});

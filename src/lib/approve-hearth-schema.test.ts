import { test } from "node:test";
import assert from "node:assert/strict";
import { approveHearthSchema } from "./validation/schemas";

const ID = "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e";

test("the approve body takes a uuid and approve or reject", () => {
  assert.equal(approveHearthSchema.safeParse({ id: ID }).success, true);
  assert.equal(approveHearthSchema.safeParse({ id: ID, decision: "approve" }).success, true);
  assert.equal(approveHearthSchema.safeParse({ id: ID, decision: "reject" }).success, true);
});

test("a bad id or an unknown decision is refused, not read as approve", () => {
  for (const body of [null, {}, { id: "" }, { id: "not-a-uuid" }, { id: ID, decision: "yes" }, { id: ID, decision: "rejected" }]) {
    assert.equal(approveHearthSchema.safeParse(body).success, false, JSON.stringify(body));
  }
});

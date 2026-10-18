import { test } from "node:test";
import assert from "node:assert/strict";
import { ownerDeployRefusal } from "./deploy-guard";

const approved = { metadata: { self_serve: true, review: "approved" }, economic_config: {} };

test("owner of an approved Hearth with no empire may deploy once", () => {
  assert.equal(ownerDeployRefusal(approved, false), null);
});

test("owner is refused once an empire id is recorded", () => {
  const h = { ...approved, economic_config: { empire_id: "0xabc" } };
  assert.equal(ownerDeployRefusal(h, false)?.status, 409);
});

test("owner is refused once an empire address is recorded", () => {
  const h = { ...approved, economic_config: { empire_address: "0xdef" } };
  assert.equal(ownerDeployRefusal(h, false)?.status, 409);
});

test("owner of a self-serve Hearth still in review is refused", () => {
  const h = { metadata: { self_serve: true, review: "pending" }, economic_config: {} };
  assert.equal(ownerDeployRefusal(h, false)?.status, 403);
});

test("operator-made Hearth (not self-serve) with no empire: owner may deploy", () => {
  assert.equal(ownerDeployRefusal({ metadata: {}, economic_config: {} }, false), null);
});

test("the operator is never refused here", () => {
  const h = { metadata: { self_serve: true, review: "pending" }, economic_config: { empire_id: "0xabc" } };
  assert.equal(ownerDeployRefusal(h, true), null);
});

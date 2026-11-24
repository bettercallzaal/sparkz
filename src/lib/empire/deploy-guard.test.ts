import { test } from "node:test";
import assert from "node:assert/strict";
import { launchLockRefusal, ownerDeployRefusal, pendingDeployTx, tokenLaunchRefusal } from "./deploy-guard";

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

// Token launch (graduation).
const tokenless = {
  metadata: {},
  economic_config: { empire_id: "zoostr6071a1", empire_address: "0x74dc182017d698e5d262b6a87a3e35ac9125bbed", empire_token_type: "custom_tokenless" },
};

test("token launch: a Hearth with a tokenless empire may graduate (owner and operator)", () => {
  assert.equal(tokenLaunchRefusal(tokenless, false), null);
  assert.equal(tokenLaunchRefusal(tokenless, true), null);
});

test("token launch: a Hearth with no empire may launch", () => {
  assert.equal(tokenLaunchRefusal(approved, false), null);
});

test("token launch: refused once a token is recorded, even for the operator", () => {
  const h = { metadata: {}, economic_config: { empire_mode: "token", token_address: "0x" + "1".repeat(40) } };
  assert.equal(tokenLaunchRefusal(h, false)?.status, 409);
  assert.equal(tokenLaunchRefusal(h, true)?.status, 409);
});

test("token launch: refused when the linked empire is a token empire", () => {
  const byId = { metadata: {}, economic_config: { empire_id: "0x" + "a".repeat(40) } };
  const byType = { metadata: {}, economic_config: { empire_id: "x1", empire_token_type: "clanker" } };
  assert.equal(tokenLaunchRefusal(byId, true)?.status, 409);
  assert.equal(tokenLaunchRefusal(byType, true)?.status, 409);
});

test("token launch: owner of a self-serve Hearth still in review is refused", () => {
  const h = { metadata: { self_serve: true, review: "pending" }, economic_config: {} };
  assert.equal(tokenLaunchRefusal(h, false)?.status, 403);
});

test("a sent but unregistered deploy is pending; a registered one is not", () => {
  const tx = "0x" + "a".repeat(64);
  assert.equal(pendingDeployTx({ economic_config: { pending_deploy_tx: tx } }), tx);
  assert.equal(pendingDeployTx({ economic_config: { pending_deploy_tx: tx, token_address: "0xabc" } }), null);
  assert.equal(pendingDeployTx({ economic_config: { pending_deploy_tx: "nope" } }), null);
  assert.equal(pendingDeployTx({}), null);
});

test("launch lock: free, stale, or held by the same wallet lets a config through; another wallet waits", () => {
  const now = Date.parse("2026-11-25T00:00:00Z");
  const held = (at: string, by: string) => ({ economic_config: { token_launch_lock_at: at, token_launch_lock_by: by } });
  assert.equal(launchLockRefusal({ economic_config: {} }, "0xAA", now), null);
  assert.equal(launchLockRefusal(held("2026-11-24T23:00:00Z", "0xbb"), "0xaa", now), null);
  assert.equal(launchLockRefusal(held("2026-11-24T23:58:00Z", "0xaa"), "0xAA", now), null);
  assert.equal(launchLockRefusal(held("2026-11-24T23:58:00Z", "0xbb"), "0xaa", now)?.status, 409);
});

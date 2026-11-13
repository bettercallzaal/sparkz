import { test } from "node:test";
import assert from "node:assert/strict";
import { hearthConnections } from "./hearth-connections";

type H = Parameters<typeof hearthConnections>[0];
const hearth = (over: Partial<H> = {}): H => ({
  type: "creator",
  economic_config: {},
  metadata: {},
  ...over,
} as H);
const ids = (h: H) => hearthConnections(h).map((c) => c.id);

test("a bare Hearth has no connections", () => {
  assert.deepEqual(hearthConnections(hearth()), []);
});

test("empty config objects are tolerated even if a caller passes null", () => {
  assert.deepEqual(ids(hearth({ economic_config: null as unknown as H["economic_config"], metadata: null as unknown as H["metadata"] })), []);
});

test("Empire needs empire === true, not just a truthy value", () => {
  assert.deepEqual(ids(hearth({ economic_config: { empire: true } })), ["empire"]);
  assert.deepEqual(ids(hearth({ economic_config: { empire: "yes" } })), []);
});

test("any of the four token signals marks the Hearth tokenized, once", () => {
  for (const econ of [
    { token: true },
    { token_address: "0xabc" },
    { empire_token_type: "clanker" },
    { tokenization_rail: "clanker" },
  ]) {
    assert.deepEqual(ids(hearth({ economic_config: econ })), ["token"], JSON.stringify(econ));
  }
  assert.deepEqual(ids(hearth({ economic_config: { token: true, token_address: "0xabc" } })), ["token"]);
  assert.deepEqual(ids(hearth({ economic_config: { empire_token_type: "tokenless", tokenization_rail: "empire" } })), []);
});

test("Farcaster shows when an fid, username or channel is linked", () => {
  for (const farcaster of [{ fid: 3 }, { username: "zaal" }, { channel: "zao" }]) {
    assert.deepEqual(ids(hearth({ metadata: { farcaster } })), ["farcaster"], JSON.stringify(farcaster));
  }
  assert.deepEqual(ids(hearth({ metadata: { farcaster: { fid: null, username: "", channel: null } } })), []);
});

test("GitHub shows for an OSS Hearth or one with a repo", () => {
  assert.deepEqual(ids(hearth({ type: "oss" })), ["github"]);
  assert.deepEqual(ids(hearth({ metadata: { repo: "bettercallzaal/sparkz" } })), ["github"]);
  assert.deepEqual(ids(hearth({ metadata: { github: "bettercallzaal" } })), ["github"]);
});

test("a media kit in either config shows Media Kit", () => {
  assert.deepEqual(ids(hearth({ economic_config: { media_kit: true } })), ["media"]);
  assert.deepEqual(ids(hearth({ metadata: { baraza: { id: 1 } } })), ["media"]);
});

test("everything at once comes back in a stable order with labels", () => {
  const all = hearthConnections(
    hearth({
      type: "oss",
      economic_config: { empire: true, token: true, media_kit: true },
      metadata: { farcaster: { channel: "zao" } },
    }),
  );
  assert.deepEqual(all, [
    { id: "empire", label: "Empire" },
    { id: "token", label: "Token" },
    { id: "farcaster", label: "Farcaster" },
    { id: "github", label: "GitHub" },
    { id: "media", label: "Media Kit" },
  ]);
});

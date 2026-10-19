import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRuntime } from "./runtime";
import type { HearthPlugin } from "./types";

const noop = async () => [];
const plugins: HearthPlugin[] = [
  { id: "signal-human", version: "1", name: "h", signalSources: [{ id: "human", detectSignals: noop }] },
  { id: "signal-farcaster", version: "1", name: "f", signalSources: [{ id: "farcaster", detectSignals: noop }] },
  { id: "approval-in-app", version: "1", name: "a", approvalChannels: [{ id: "in_app", enabled: true, notify: async () => {} }] },
  { id: "approval-discord", version: "1", name: "d", approvalChannels: [{ id: "discord", enabled: true, notify: async () => {} }] },
  { id: "connector-audius", version: "1", name: "au", connectors: [{ id: "connector-audius", kind: "catalog", label: "Audius" }] },
];

test("no rows: every known spoke is on", () => {
  const rt = buildRuntime(plugins, []);
  assert.equal(rt.signalSourceEnabled("farcaster"), true);
  assert.deepEqual([...rt.enabledApprovalChannels].sort(), ["discord", "in_app"]);
  assert.equal(rt.enabledConnectors.length, 1);
});

test("a toggled-off spoke removes its components", () => {
  const rt = buildRuntime(plugins, [
    { pluginId: "signal-farcaster", enabled: false, config: {} },
    { pluginId: "approval-discord", enabled: false, config: {} },
    { pluginId: "connector-audius", enabled: false, config: {} },
  ]);
  assert.equal(rt.signalSourceEnabled("farcaster"), false);
  assert.equal(rt.signalSourceEnabled("human"), true);
  assert.deepEqual([...rt.enabledApprovalChannels], ["in_app"]);
  assert.equal(rt.enabledConnectors.length, 0);
  assert.equal(rt.isEnabled("approval-discord"), false);
});

test("connector carries its per-Hearth config", () => {
  const rt = buildRuntime(plugins, [
    { pluginId: "connector-audius", enabled: true, config: { AUDIUS_HANDLE: "rac" } },
  ]);
  assert.deepEqual(rt.enabledConnectors[0].config, { AUDIUS_HANDLE: "rac" });
});

test("unknown plugin ids and unknown component ids are off", () => {
  const rt = buildRuntime(plugins, [{ pluginId: "nope", enabled: true, config: {} }]);
  assert.equal(rt.isEnabled("nope"), false);
  assert.equal(rt.signalSourceEnabled("telegram"), false);
});

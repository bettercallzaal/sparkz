import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRuntime } from "./runtime";
import type { HearthPlugin } from "./types";

const plugins: HearthPlugin[] = [
  { id: "connector-discord", version: "1", name: "d", connectors: [{ id: "connector-discord", kind: "catalog", label: "Discord" }] },
  { id: "connector-audius", version: "1", name: "au", connectors: [{ id: "connector-audius", kind: "catalog", label: "Audius" }] },
];

test("no rows: every known spoke is on", () => {
  const rt = buildRuntime(plugins, []);
  assert.equal(rt.isEnabled("connector-discord"), true);
  assert.equal(rt.enabledConnectors.length, 2);
});

test("a toggled-off spoke removes its components", () => {
  const rt = buildRuntime(plugins, [
    { pluginId: "connector-discord", enabled: false, config: {} },
  ]);
  assert.equal(rt.enabledConnectors.length, 1);
  assert.equal(rt.enabledConnectors[0].connector.id, "connector-audius");
  assert.equal(rt.isEnabled("connector-discord"), false);
});

test("connector carries its per-Hearth config", () => {
  const rt = buildRuntime(plugins, [
    { pluginId: "connector-audius", enabled: true, config: { AUDIUS_HANDLE: "rac" } },
  ]);
  assert.deepEqual(rt.enabledConnectors.find((e) => e.connector.id === "connector-audius")?.config, { AUDIUS_HANDLE: "rac" });
});

test("unknown plugin ids are off", () => {
  const rt = buildRuntime(plugins, [{ pluginId: "nope", enabled: true, config: {} }]);
  assert.equal(rt.isEnabled("nope"), false);
});

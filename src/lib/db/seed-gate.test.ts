import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const GATE = fileURLToPath(new URL("../../../scripts/seed-gate.sh", import.meta.url));
const WORKFLOW = fileURLToPath(new URL("../../../.github/workflows/db.yml", import.meta.url));

function gate(env: Record<string, string>) {
  // Only the variables under test, so nothing from the runner's own env leaks in.
  // Next's types make NODE_ENV required on ProcessEnv; the child shell does not need it.
  const childEnv = { PATH: process.env.PATH ?? "", ...env } as unknown as NodeJS.ProcessEnv;
  const r = spawnSync("bash", [GATE], { env: childEnv, encoding: "utf8" });
  return { status: r.status, out: r.stdout.trim() };
}

const NEON = { SPARKZ_DATABASE_URL: "postgresql://u:p@ep-x.us-east-1.aws.neon.tech/neondb" };
const SUPA = { SUPABASE_SERVICE_ROLE_KEY: "test-only-not-a-key" };

test("on Neon a push never seeds", () => {
  const r = gate({ ...NEON, EVENT: "push", SEED_INPUT: "" });
  assert.equal(r.status, 0);
  assert.match(r.out, /^skip: on Neon/);
  // Even if a seed input were present, only a manual run may seed on Neon.
  assert.match(gate({ ...NEON, EVENT: "push", SEED_INPUT: "true" }).out, /^skip: on Neon/);
});

test("on Neon a manual run seeds only with the box ticked", () => {
  assert.equal(gate({ ...NEON, EVENT: "workflow_dispatch", SEED_INPUT: "true" }).out, "run");
  assert.match(gate({ ...NEON, EVENT: "workflow_dispatch", SEED_INPUT: "false" }).out, /^skip/);
});

test("on Supabase a push still seeds, as before", () => {
  assert.equal(gate({ ...SUPA, EVENT: "push", SEED_INPUT: "" }).out, "run");
  assert.equal(gate({ ...SUPA, EVENT: "workflow_dispatch", SEED_INPUT: "true" }).out, "run");
  assert.match(gate({ ...SUPA, EVENT: "workflow_dispatch", SEED_INPUT: "false" }).out, /^skip/);
});

test("with no database configured the gate fails red", () => {
  assert.equal(gate({ EVENT: "push", SEED_INPUT: "" }).status, 1);
});

test("the workflow's seed step goes through the gate", () => {
  const yml = readFileSync(WORKFLOW, "utf8");
  const seedStep = yml.slice(yml.indexOf("- name: Seed the ZAO Sparks"));
  assert.match(seedStep, /bash scripts\/seed-gate\.sh/);
  assert.match(seedStep, /EVENT: \$\{\{ github\.event_name \}\}/);
  assert.match(seedStep, /SEED_INPUT: \$\{\{ inputs\.seed \}\}/);
  // The gate's verdict must come before the seed script runs.
  assert.ok(seedStep.indexOf("seed-gate.sh") < seedStep.indexOf("seed-zao-projects.mjs"));
});

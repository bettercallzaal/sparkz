import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { tokenLaunchRefusal } from "@/lib/empire/deploy-guard";
import { canManageHearth } from "@/lib/can-manage";

// The /access page ("What you can do") is a check-mark table of features by sign-in.
// Its rows must stay true to the code; these tests pin the claims that would mislead
// people if they drifted.
const PAGE = join(process.cwd(), "src", "app", "access", "page.tsx");
const src = readFileSync(PAGE, "utf8");

const row = (feature: string) => {
  const m = src.match(new RegExp(`feature: "${feature}", tiers: \\[([^\\]]*)\\]`));
  assert.ok(m, `row "${feature}" is on the page`);
  return m[1];
};

test("access page lists the four ways in", () => {
  for (const t of ['"out"', '"email"', '"wallet"', '"farcaster"']) assert.match(src, new RegExp(`key: ${t}`));
});

test("boosting needs a wallet or Farcaster sign-in, not just looking", () => {
  const r = row("Boost a Hearth");
  assert.doesNotMatch(r, /"out"|"email"/);
  assert.match(r, /"wallet"/);
  assert.match(r, /"farcaster"/);
});

test("coin launch is operator only: no tier is marked, and the code refuses non-operators", () => {
  assert.equal(row("Launch your Hearth's coin").trim(), "");
  assert.match(src, /note: "Operator only for now"/);
  const refusal = tokenLaunchRefusal({ economic_config: {} }, false);
  assert.equal(refusal?.status, 403);
  assert.equal(tokenLaunchRefusal({ economic_config: {} }, true), null);
});

test("running a Hearth is Farcaster only, matching the fid-only owner check", () => {
  assert.equal(row("Run your Hearth: Sparks, bounties, settings").trim(), '"farcaster"');
  // A wallet-only session has no FID, so it can never manage a Hearth.
  assert.equal(canManageHearth({ admin: false, fid: null }, 123), false);
  assert.equal(canManageHearth({ admin: false, fid: 123 }, 123), true);
});

test("opening a Hearth says invite-only", () => {
  assert.match(src, /Invite-only during the beta/);
});

test("no check-mark or dot characters as marks", () => {
  assert.doesNotMatch(src, /✓|·/);
});

test("Google sign-in is described as coming, not live", () => {
  assert.match(src, /Google sign-in is coming/);
});

test("no em dash in the page copy", () => {
  assert.doesNotMatch(src, /—/);
});

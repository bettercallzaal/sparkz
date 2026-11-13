import { test } from "node:test";
import assert from "node:assert/strict";
import { OWNER_BACKFILL, ZAO_HEARTHS } from "./zao-seed";
import { ADMIN_FIDS } from "./admin-identities";
import { ALPHA_FIDS } from "./alpha-access";

test("seed slugs are unique", () => {
  const slugs = ZAO_HEARTHS.map((h) => h.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every seeded and backfilled owner is a listed admin or alpha tester", () => {
  for (const o of [...ZAO_HEARTHS, ...OWNER_BACKFILL]) {
    assert.ok(ADMIN_FIDS.has(o.owner_fid) || ALPHA_FIDS.has(o.owner_fid), o.slug);
  }
});

test("Zaal owns the four live Hearths that had no owner", () => {
  assert.deepEqual(
    OWNER_BACKFILL.map((b) => b.slug).sort(),
    ["coc-concertz", "sparkz", "zabal", "zabal-gamez"],
  );
  assert.ok(OWNER_BACKFILL.every((b) => ADMIN_FIDS.has(b.owner_fid)));
});

test("IMan owns his own Hearth", () => {
  const iman = ZAO_HEARTHS.find((h) => h.slug === "iman-afrikah");
  assert.ok(iman && ALPHA_FIDS.has(iman.owner_fid));
});

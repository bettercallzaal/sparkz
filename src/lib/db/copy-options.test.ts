import { test } from "node:test";
import assert from "node:assert/strict";
import { copyTargetUrl, neonHost, parseCopyArgs } from "../../../scripts/lib/copy-options.mjs";

test("the copy is a dry run unless --apply is given", () => {
  assert.deepEqual(parseCopyArgs([]), { apply: false, withImages: false });
  assert.deepEqual(parseCopyArgs(["--with-images"]), { apply: false, withImages: true });
  assert.deepEqual(parseCopyArgs(["--apply"]), { apply: true, withImages: false });
  assert.deepEqual(parseCopyArgs(["--apply", "--with-images"]), { apply: true, withImages: true });
});

test("--dry-run wins over --apply", () => {
  assert.equal(parseCopyArgs(["--apply", "--dry-run"]).apply, false);
});

test("only a Neon host is accepted as the copy target", () => {
  assert.equal(
    neonHost("postgresql://u:p@ep-snowy-flower-123.us-east-1.aws.neon.tech/neondb?sslmode=require"),
    "ep-snowy-flower-123.us-east-1.aws.neon.tech",
  );
  for (const bad of [
    "postgresql://u:p@db.abcdefgh.supabase.co:5432/postgres",
    "postgresql://u:p@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    "postgresql://u:p@localhost:5432/x",
    "postgresql://u:p@neon.tech.evil.example/x",
    "postgresql://u:p@evilneon.tech/x",
    "not a url",
    "",
    undefined,
  ]) {
    assert.equal(neonHost(bad), null, String(bad));
  }
});

test("the copy target accepts Vercel's unprefixed Neon names, unpooled first", () => {
  const neon = (n: string) => `postgresql://u:p@ep-${n}.us-east-1.aws.neon.tech/neondb`;
  // What the sparkz project has (14 Nov 2026): no STORAGE prefix.
  assert.equal(copyTargetUrl({ DATABASE_URL_UNPOOLED: neon("direct"), DATABASE_URL: neon("pooled") }), neon("direct"));
  assert.equal(copyTargetUrl({ DATABASE_URL: neon("pooled") }), neon("pooled"));
  // An explicit SPARKZ_DATABASE_URL, then the STORAGE-prefixed names, still win.
  assert.equal(copyTargetUrl({ SPARKZ_DATABASE_URL: neon("explicit"), DATABASE_URL_UNPOOLED: neon("direct") }), neon("explicit"));
  assert.equal(copyTargetUrl({ STORAGE_DATABASE_URL_UNPOOLED: neon("prefixed"), DATABASE_URL: neon("pooled") }), neon("prefixed"));
  assert.equal(copyTargetUrl({}), undefined);
  // Whatever name it comes from, the host check still applies.
  assert.equal(neonHost(copyTargetUrl({ DATABASE_URL: "postgresql://u:p@db.x.supabase.co/postgres" })), null);
});

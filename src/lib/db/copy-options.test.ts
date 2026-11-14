import { test } from "node:test";
import assert from "node:assert/strict";
import { neonHost, parseCopyArgs } from "../../../scripts/lib/copy-options.mjs";

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

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// App Review 1.2 (user-generated content): the app must publish contact information and
// explain how to report content and block users. The /support page carries that copy.
const PAGE = join(process.cwd(), "src", "app", "support", "page.tsx");

test("support page publishes report, block and contact paths", () => {
  const src = readFileSync(PAGE, "utf8");
  assert.match(src, /Report content/);
  assert.match(src, /Block a person/);
  assert.match(src, /Delete your Sparkz data/);
  assert.match(src, /github\.com\/bettercallzaal\/sparkz\/issues/);
  assert.match(src, /href="\/terms"/);
  assert.match(src, /href="\/privacy"/);
});

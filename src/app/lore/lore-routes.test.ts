import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const APP = join(ROOT, "src", "app");
const LORE = join(APP, "lore");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

test("preview routes exist and render a default export", () => {
  for (const rel of ["page.tsx", "a/page.tsx", "b/page.tsx"]) {
    const file = join(LORE, rel);
    assert.ok(existsSync(file), `missing ${rel}`);
    assert.match(readFileSync(file, "utf8"), /export default (async )?function/, rel);
  }
});

test("preview routes are noindex", () => {
  const meta = readFileSync(join(LORE, "_scene", "robots.ts"), "utf8");
  assert.match(meta, /index: false/);
  assert.match(meta, /follow: false/);
});

test("nothing in the app links to /lore", () => {
  const hits = walk(APP)
    .filter((f) => /\.(tsx|ts|css|json)$/.test(f))
    .filter((f) => !f.startsWith(LORE + "/") && !f.startsWith(LORE + "\\"))
    .filter((f) => /["'`(]\/lore\b/.test(readFileSync(f, "utf8")));
  assert.deepEqual(hits, []);
});

test("hero copy has no crypto, money or raise words", () => {
  const banned = /\b(coin|token|wallet|raise|invest\w*|earn\w*|profit|percent)\b/i;
  const hero = walk(LORE).filter((f) => f.endsWith(".tsx"));
  for (const f of hero) {
    const lines = readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
      // Ignore code-only lines (imports, types, styles); check text a reader sees.
      if (/^\s*(import|export|const|type|\/\/)/.test(line)) return;
      if (/style|rgba|radial|className|gradient/.test(line)) return;
      assert.doesNotMatch(line, banned, `${f}:${i + 1}`);
    });
  }
});

test("no internal order numbers in preview code or docs", () => {
  const files = [...walk(LORE), join(ROOT, "docs", "lore.md")];
  for (const f of files) {
    assert.doesNotMatch(readFileSync(f, "utf8"), /\bORD-?\d+|\border\s*#?\d{3}\b/i, f);
  }
});

test("home page is unchanged versus origin/main", () => {
  const rel = "src/app/page.tsx";
  const base = execFileSync("git", ["show", `origin/main:${rel}`], {
    cwd: ROOT,
    encoding: "utf8",
  });
  // Normalize CRLF: a Windows checkout converts line endings, the blob is unchanged.
  const now = readFileSync(join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
  assert.equal(now, base.replace(/\r\n/g, "\n"), "src/app/page.tsx differs from origin/main");
});

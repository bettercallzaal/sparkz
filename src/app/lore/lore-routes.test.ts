import { test } from "node:test";
import assert from "node:assert/strict";
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

// Text a reader sees: the content between JSX tags, with the tags and their
// attributes (className, style) stripped, so styled headings are checked too.
export function renderedText(source: string): string {
  return source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/<\/?[A-Za-z][^>]*>/g, "\n")
    .split("\n")
    .filter((line) => !/^\s*(import|export|const|type|\/\/)/.test(line))
    .join("\n");
}

const BANNED = /\b(crypto\w*|coin|token|wallet|raise|invest\w*|earn\w*|profit|percent)\b|%/i;

test("hero copy has no crypto, money or raise words", () => {
  const hero = walk(LORE).filter((f) => f.endsWith(".tsx"));
  for (const f of hero) {
    assert.doesNotMatch(renderedText(readFileSync(f, "utf8")), BANNED, f);
  }
});

test("copy check reads text inside styled tags", () => {
  const text = renderedText('<h1 className="x">Light a Hearth. <span className="y">Earn a coin.</span></h1>');
  assert.match(text, BANNED);
  assert.doesNotMatch(renderedText('<h1 className="coin-style">Light a Hearth.</h1>'), BANNED);
});

test("no internal order numbers in preview code or docs", () => {
  const files = [...walk(LORE), join(ROOT, "docs", "lore.md")];
  for (const f of files) {
    assert.doesNotMatch(readFileSync(f, "utf8"), /\bORD-?\d+|\border\s*#?\d{3}\b/i, f);
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Zoostr copy must match the live Hearth (Zaal, 2026-11-19: the "50+" claim "is mistaken";
// use real numbers). Any public page that names Zoostr must not, within a few lines of that
// mention, claim a booster count, a graduation, a live token or a Base launch. A number about
// Zoostr belongs on the page only when it is read live from the Hearth.

const APP_DIR = join(process.cwd(), "src", "app");
const WINDOW_BEFORE = 3;
const WINDOW_AFTER = 4;

const BANNED: { name: string; re: RegExp }[] = [
  { name: "a count like 50+ or 34+", re: /\b\d+\+\s*(boosters|people|members|backers)\b/i },
  { name: "graduated", re: /\bgraduated\b/i },
  { name: "live on Base", re: /live on base/i },
  { name: "Clanker came second", re: /clanker came/i },
  { name: "a $ZOOSTR token", re: /\$ZOOSTR/ },
];

function pageFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...pageFiles(p));
    else if (/\.(tsx|ts)$/.test(name) && !name.endsWith(".test.ts")) out.push(p);
  }
  return out;
}

export function zoostrClaimViolations(dir: string = APP_DIR): string[] {
  const found: string[] = [];
  for (const file of pageFiles(dir)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (!/zoostr/i.test(line)) return;
      const from = Math.max(0, i - WINDOW_BEFORE);
      const to = Math.min(lines.length, i + WINDOW_AFTER + 1);
      for (let j = from; j < to; j++) {
        for (const b of BANNED) {
          if (b.re.test(lines[j])) {
            found.push(`${relative(process.cwd(), file)}:${j + 1} ${b.name}`);
          }
        }
      }
    });
  }
  return [...new Set(found)];
}

test("the scan finds page files to read (it is not vacuous)", () => {
  const files = pageFiles(APP_DIR);
  assert.ok(files.length > 20, `expected many page files, got ${files.length}`);
  assert.ok(
    files.some((f) => readFileSync(f, "utf8").toLowerCase().includes("zoostr")),
    "expected at least one page that names Zoostr",
  );
});

test("no public page makes a Zoostr claim the live Hearth does not show", () => {
  assert.deepEqual(zoostrClaimViolations(), []);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// App Review 3.1.1 / 3.1.5: the iOS shell must not show crypto token UI (token contract,
// Clanker link, token symbol, treasury figures). The shell hides .web-only
// (src/app/shell.css), so each token surface must sit inside a .web-only wrapper.
const read = (...p: string[]) => readFileSync(join(process.cwd(), "src", ...p), "utf8");
const PAGE = ["app", "c", "[slug]", "page.tsx"];

function wrappedBy(src: string, marker: string, wrapperRe: RegExp, label: string) {
  const at = src.indexOf(marker);
  assert.ok(at > 0, `${label} usage not found`);
  const before = src.slice(Math.max(0, at - 400), at);
  assert.match(before, wrapperRe, `${label} is not inside a web-only wrapper`);
}

test("token panel is wrapped in web-only so the iOS shell hides it", () => {
  const src = read(...PAGE);
  const at = src.indexOf("<TokenSparkPanel meta={tokenSpark} />");
  assert.ok(at > 0, "TokenSparkPanel usage not found");
  const before = src.slice(Math.max(0, at - 120), at);
  assert.match(before, /<div className="web-only">\s*$/, "TokenSparkPanel is not inside a web-only wrapper");
});

test("Empire leaderboard (token symbol, treasury, empirebuilder link) is wrapped in web-only", () => {
  wrappedBy(
    read(...PAGE),
    "<EmpireLeaderboard empireId={econ.empire_id}",
    /<div className="web-only">\s*<section[^>]*>\s*<h2[^>]*>Empire leaderboard<\/h2>\s*<div[^>]*>\s*$/,
    "EmpireLeaderboard",
  );
});

test("onchain explorer link on Sparks and the Clanker demo copy are web-only", () => {
  assert.match(read("app", "_components", "SparksPanel.tsx"), /className="web-only text-accent hover:underline">\s*Onchain/);
  const demo = read("app", "demo", "page.tsx");
  assert.match(demo, /<div className="web-only">\s*<Step n="4"/);
  assert.match(demo, /<section className="web-only border-t border-border py-8">\s*<h2[^>]*>\s*Why it/);
});

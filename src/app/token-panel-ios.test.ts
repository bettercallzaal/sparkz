import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// App Review 3.1.1 / 3.1.5: the iOS shell must not show crypto token UI (token contract,
// Clanker link). The shell hides .web-only (src/app/shell.css), so the token panel must sit
// inside a .web-only wrapper on the Hearth page.
const PAGE = join(process.cwd(), "src", "app", "c", "[slug]", "page.tsx");

test("token panel is wrapped in web-only so the iOS shell hides it", () => {
  const src = readFileSync(PAGE, "utf8");
  const at = src.indexOf("<TokenSparkPanel meta={tokenSpark} />");
  assert.ok(at > 0, "TokenSparkPanel usage not found");
  const before = src.slice(Math.max(0, at - 120), at);
  assert.match(before, /<div className="web-only">\s*$/, "TokenSparkPanel is not inside a web-only wrapper");
});

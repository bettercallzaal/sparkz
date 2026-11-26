import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { APP_TABS, tabFor, type AppTab } from "./app-tabs";

// The iPhone app's bottom bar (Zaal, 25 Nov 2026): Home, My Hearths, My Sparkz, Me.
// Explore is reached from Home, not a tab. This is the live web app the released iOS app
// loads, so a wrong list ships to every phone on merge.

function checkBar(tabs: readonly Pick<AppTab, "title" | "href">[]): void {
  assert.deepEqual(
    tabs.map((t) => t.title),
    ["Home", "My Hearths", "My Sparkz", "Me"],
  );
  assert.ok(!tabs.some((t) => t.href.startsWith("/explore")), "Explore is not a tab");
}

test("the bar is Home, My Hearths, My Sparkz, Me, with no Explore tab", () => {
  checkBar(APP_TABS);
  assert.deepEqual(
    APP_TABS.map((t) => t.href),
    ["/", "/my-hearths", "/my-sparkz", "/profile"],
  );
});

test("red control: the old two-tab bar (Home, Me) fails the check", () => {
  const old = [
    { title: "Home", href: "/" },
    { title: "Me", href: "/profile" },
  ];
  assert.throws(() => checkBar(old));
});

test("red control: a bar with Explore as a tab fails the check", () => {
  const withExplore = [
    { title: "Home", href: "/" },
    { title: "My Hearths", href: "/my-hearths" },
    { title: "My Sparkz", href: "/my-sparkz" },
    { title: "Me", href: "/explore" },
  ];
  assert.throws(() => checkBar(withExplore));
});

test("each route selects the right tab; Explore and Hearth pages stay under Home", () => {
  assert.equal(tabFor("/").id, "home");
  assert.equal(tabFor("/explore").id, "home");
  assert.equal(tabFor("/c/zoostr").id, "home");
  assert.equal(tabFor("/my-hearths").id, "hearths");
  assert.equal(tabFor("/my-sparkz").id, "sparkz");
  assert.equal(tabFor("/my-sparkz/anything").id, "sparkz");
  assert.equal(tabFor("/profile").id, "me");
  // Red control: a route that only shares a prefix is not the tab.
  assert.equal(tabFor("/my-hearthsx").id, "home");
});

test("the native bar and the HTML fallback both draw the shared list", () => {
  for (const file of ["NativeChrome.tsx", "TabBar.tsx"]) {
    const src = readFileSync(join(process.cwd(), "src", "app", "_components", file), "utf8");
    assert.match(src, /from "@\/lib\/app-tabs"/, `${file} imports the shared list`);
    assert.doesNotMatch(src, /href: "\/profile"/, `${file} has no tab list of its own`);
  }
});

test("both new tabs have a page with a signed-out sign-in prompt", () => {
  for (const dir of ["my-hearths", "my-sparkz"]) {
    const src = readFileSync(join(process.cwd(), "src", "app", dir, "page.tsx"), "utf8");
    assert.match(src, /state\.kind === "signed-out" && <SignInPrompt/, `${dir} handles signed out`);
  }
  const prompt = readFileSync(join(process.cwd(), "src", "app", "_components", "MeList.tsx"), "utf8");
  assert.match(prompt, /href="\/profile"/, "the prompt links to sign-in");
  assert.match(prompt, /href="\/explore"/, "the prompt keeps a way to browse, no dead end");
});

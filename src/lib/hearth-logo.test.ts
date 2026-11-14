import { test } from "node:test";
import assert from "node:assert/strict";
import { hearthLogo } from "./hearth-logo";

test("an uploaded picture wins over everything else", () => {
  assert.equal(
    hearthLogo({ slug: "zabal", metadata: { image: "https://x.test/a.png", logo_uri: "https://x.test/b.png" } }),
    "https://x.test/a.png",
  );
});

test("an Empire token logo is used when there is no upload (ZABAL, ZABAL Gamez)", () => {
  assert.equal(hearthLogo({ slug: "zabal", metadata: { logo_uri: "https://x.test/b.png" } }), "https://x.test/b.png");
});

test("a ZAO Hearth with no picture gets its bundled logo, even with no metadata loaded", () => {
  assert.equal(hearthLogo({ slug: "coc-concertz", metadata: {} }), "/hearths/coc-concertz.jpeg");
  assert.equal(hearthLogo({ slug: "zao-festivals" }), "/hearths/zao-festivals.png");
});

test("an unknown Hearth with no picture gets none, so Avatar draws the initial", () => {
  assert.equal(hearthLogo({ slug: "someone-new", metadata: null }), null);
});

test("an unsafe or malformed value is ignored, not put in an img src", () => {
  assert.equal(hearthLogo({ slug: "x", metadata: { image: "javascript:alert(1)" } }), null);
  assert.equal(hearthLogo({ slug: "x", metadata: { image: "//evil.test/a.png" } }), null);
  assert.equal(hearthLogo({ slug: "coc-concertz", metadata: { image: 42 } }), "/hearths/coc-concertz.jpeg");
});

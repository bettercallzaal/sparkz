import { test } from "node:test";
import assert from "node:assert/strict";
import { articleHref, httpsHref } from "./safe-href";

test("Hearth links: only https becomes an href", () => {
  assert.equal(httpsHref("https://thezao.com"), "https://thezao.com");
  assert.equal(httpsHref(" https://github.com/bettercallzaal/sparkz "), "https://github.com/bettercallzaal/sparkz");
  for (const v of ["javascript:alert(1)", "JavaScript:alert(1)", " javascript:alert(1)", "data:text/html,x", "http://thezao.com", "//evil.example", "/c/x", "", null, undefined, 42, {}]) {
    assert.equal(httpsHref(v), null, String(v));
  }
});

test("article links: https, http, site paths and anchors; never javascript or protocol-relative", () => {
  for (const v of ["https://thezao.com", "http://example.com", "/blog/x", "#top"]) assert.equal(articleHref(v), v);
  for (const v of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "vbscript:x"]) assert.equal(articleHref(v), null, v);
});

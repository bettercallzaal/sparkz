import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRepoRef } from "./github";

test("parseRepoRef accepts owner/repo and github URLs", () => {
  assert.deepEqual(parseRepoRef("bettercallzaal/sparkz"), { owner: "bettercallzaal", repo: "sparkz" });
  assert.deepEqual(parseRepoRef("https://github.com/bettercallzaal/sparkz"), {
    owner: "bettercallzaal",
    repo: "sparkz",
  });
  assert.deepEqual(parseRepoRef("https://github.com/a/b.git"), { owner: "a", repo: "b" });
});

test("parseRepoRef rejects path-traversal segments (would re-target the GitHub API)", () => {
  assert.equal(parseRepoRef("../users"), null);
  assert.equal(parseRepoRef("..%2f..%2fusers"), null); // not owner/repo shaped -> null anyway
  assert.equal(parseRepoRef("owner/.."), null);
  assert.equal(parseRepoRef("../.."), null);
  assert.equal(parseRepoRef("./x"), null);
  assert.equal(parseRepoRef("a..b/repo"), null); // embedded '..'
});

test("parseRepoRef rejects malformed input", () => {
  assert.equal(parseRepoRef(""), null);
  assert.equal(parseRepoRef("noslash"), null);
  assert.equal(parseRepoRef("too/many/parts"), null);
});

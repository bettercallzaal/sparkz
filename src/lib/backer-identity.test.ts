import { test } from "node:test";
import assert from "node:assert/strict";
import { looksLikeVerifiedIdentity } from "./backer-identity";

test("a typed fid or wallet address is refused as an unsigned backer", () => {
  for (const v of ["fid:19640", "FID:1", " fid:abc ", "0x" + "a".repeat(40), "0X" + "AbCd".repeat(10)]) {
    assert.equal(looksLikeVerifiedIdentity(v), true, v);
  }
});

test("names, emails and handles still boost without signing in", () => {
  for (const v of ["zaal", "someone@example.com", "@zaal", "0x123", "0x" + "a".repeat(39), "fidel"]) {
    assert.equal(looksLikeVerifiedIdentity(v), false, v);
  }
});

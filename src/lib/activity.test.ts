import { test } from "node:test";
import assert from "node:assert/strict";
import { activityLabel } from "./activity";

test("a signed-in Farcaster backer shows as its verified FID", () => {
  assert.equal(activityLabel("fid:19640"), "Farcaster fid 19640");
});

test("an email backer never shows", () => {
  assert.equal(activityLabel("someone@example.com"), "a supporter");
});

test("a wallet is shortened like the public page", () => {
  assert.equal(activityLabel("0x7234c36a71ec237c2ae7698e8916e0735001e9af"), "0x7234...e9af");
});

test("a handle shows as given", () => {
  assert.equal(activityLabel("@zaal"), "@zaal");
});

test("a malformed fid id falls back to the public mask", () => {
  assert.equal(activityLabel("fid:abc"), "a supporter");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { isAlphaAllowed } from "./alpha-access";

test("while locked, Zaal (admin) is allowed by FID and by address", () => {
  assert.equal(isAlphaAllowed({ fid: 19640 }, true), true);
  assert.equal(isAlphaAllowed({ address: "0x7234c36A71ec237c2Ae7698e8916e0735001E9Af" }, true), true);
});

test("while locked, IMan is allowed by FID and by address, in any letter case", () => {
  assert.equal(isAlphaAllowed({ fid: 1057869 }, true), true);
  assert.equal(isAlphaAllowed({ address: "0xF73485A61856Ab07Ad57152151db3ab99dF9a8Ea" }, true), true);
  assert.equal(isAlphaAllowed({ address: "0xf73485a61856ab07ad57152151db3ab99df9a8ea" }, true), true);
});

test("while locked, everyone else is refused", () => {
  for (const identity of [
    null,
    undefined,
    {},
    { fid: null, address: null },
    { fid: 1 },
    { fid: 19641 },
    { fid: -1057869 },
    { address: "0x0000000000000000000000000000000000000000" },
    { address: "" },
  ]) {
    assert.equal(isAlphaAllowed(identity, true), false, JSON.stringify(identity));
  }
});

test("when the lock is off, everyone is allowed", () => {
  assert.equal(isAlphaAllowed({ fid: 1 }, false), true);
  assert.equal(isAlphaAllowed(null, false), true);
});

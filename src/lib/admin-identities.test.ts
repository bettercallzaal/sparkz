import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdminAddress, isAdminFid } from "./admin-identities";

test("the admin FID is an admin", () => {
  assert.equal(isAdminFid(19640), true);
});

test("other FIDs are not", () => {
  for (const fid of [0, 1, 19641, 1057869, -19640, null, undefined]) {
    assert.equal(isAdminFid(fid), false, String(fid));
  }
});

test("zaal.eth's address is an admin, in any letter case", () => {
  assert.equal(isAdminAddress("0x7234c36A71ec237c2Ae7698e8916e0735001E9Af"), true);
  assert.equal(isAdminAddress("0x7234C36A71EC237C2AE7698E8916E0735001E9AF"), true);
});

test("other addresses are not", () => {
  for (const a of [
    "0x7234c36a71ec237c2ae7698e8916e0735001e9a0",
    "0x0000000000000000000000000000000000000000",
    "",
    null,
    undefined,
  ]) {
    assert.equal(isAdminAddress(a), false, String(a));
  }
});

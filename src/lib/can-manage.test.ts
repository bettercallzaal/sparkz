import { test } from "node:test";
import assert from "node:assert/strict";
import { canManageHearth } from "./can-manage";

test("the owner may manage their Hearth", () => {
  assert.equal(canManageHearth({ admin: false, fid: 1057869 }, 1057869), true);
});

test("an admin may manage any Hearth, owned or not", () => {
  assert.equal(canManageHearth({ admin: true, fid: 19640 }, 1057869), true);
  assert.equal(canManageHearth({ admin: true, fid: 19640 }, null), true);
});

test("a signed-out visitor, another signed-in user, or anyone on an ownerless Hearth may not", () => {
  assert.equal(canManageHearth({ admin: false, fid: null }, 19640), false);
  assert.equal(canManageHearth({ admin: false, fid: 424242 }, 19640), false);
  assert.equal(canManageHearth({ admin: false, fid: 424242 }, null), false);
  assert.equal(canManageHearth({ admin: false, fid: null }, null), false);
});

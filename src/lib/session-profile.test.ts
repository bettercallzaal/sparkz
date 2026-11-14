import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeSessionProfile, type ProfileShape } from "./session-profile";

const empty: ProfileShape = { isAuthenticated: false, profile: {} };
const fresh: ProfileShape = { isAuthenticated: true, profile: { fid: 19640, username: "zaal", pfpUrl: "https://x/p.png" } };

test("Zaal's bug: auth-kit empty but the server session is valid counts as signed in", () => {
  // The TestFlight app after a reopen: Me said "Signed in, fid 19640", Home said "Sign in".
  const merged = mergeSessionProfile(empty, { viewAs: "self", fid: 19640 });
  assert.equal(merged.isAuthenticated, true);
  assert.equal(merged.profile.fid, 19640);
});

test("a fresh Farcaster sign-in keeps auth-kit's full profile", () => {
  assert.deepEqual(mergeSessionProfile(fresh, { viewAs: "self", fid: 19640 }), fresh);
  // Even before /api/auth/me has answered.
  assert.deepEqual(mergeSessionProfile(fresh, { viewAs: "self", fid: null }), fresh);
});

test("no auth-kit state and no session is signed out", () => {
  assert.equal(mergeSessionProfile(empty, { viewAs: "self", fid: null }).isAuthenticated, false);
});

test("an admin viewing as Guest always sees the signed-out shape", () => {
  for (const real of [empty, fresh]) {
    const merged = mergeSessionProfile(real, { viewAs: "guest", fid: null });
    assert.equal(merged.isAuthenticated, false);
    assert.deepEqual(merged.profile, {});
  }
});

test("View as member or user still uses the real session", () => {
  assert.equal(mergeSessionProfile(empty, { viewAs: "member", fid: 19640 }).isAuthenticated, true);
  assert.equal(mergeSessionProfile(empty, { viewAs: "user", fid: 19640 }).profile.fid, 19640);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { bountyState, votePasses, formatEth, parseEthToWei, ZERO_ADDRESS } from "./vote-state";

const ISSUER = "0xAAaaAAaaAAaaAAaaAAaaAAaaAAaaAAaaAAaaAAaa";
const OTHER = "0xBBbbBBbbBBbbBBbbBBbbBBbbBBbbBBbbBBbbBBbb";
const noVote = { currentClaim: 0n, yes: 0n, no: 0n, deadline: 0n };

test("votePasses needs a strict majority of weight", () => {
  assert.equal(votePasses(3n, 3n), false);
  assert.equal(votePasses(4n, 3n), true);
  assert.equal(votePasses(1n, 0n), true);
  assert.equal(votePasses(0n, 0n), false);
});

test("no claimer and no vote is open", () => {
  assert.deepEqual(bountyState({ issuer: ISSUER, claimer: ZERO_ADDRESS, claimId: 0n }, noVote, 100), { status: "open", vote: null });
});

test("claimer == issuer is cancelled, other claimer is accepted (case-insensitive)", () => {
  assert.equal(bountyState({ issuer: ISSUER, claimer: ISSUER.toLowerCase(), claimId: 0n }, noVote, 1).status, "cancelled");
  assert.equal(bountyState({ issuer: ISSUER, claimer: OTHER, claimId: 2n }, noVote, 1).status, "accepted");
});

test("vote running, then ended after the deadline", () => {
  const v = { currentClaim: 7n, yes: 10n, no: 4n, deadline: 1000n };
  const b = { issuer: ISSUER, claimer: ZERO_ADDRESS, claimId: 0n };
  const during = bountyState(b, v, 999);
  assert.equal(during.status, "voting");
  assert.equal(during.vote?.passing, true);
  assert.equal(during.vote?.claimId, "7");
  assert.equal(bountyState(b, v, 1000).status, "vote_ended");
});

test("a vote that is tied is not passing", () => {
  const s = bountyState({ issuer: ISSUER, claimer: ZERO_ADDRESS, claimId: 0n }, { currentClaim: 1n, yes: 5n, no: 5n, deadline: 10n }, 1);
  assert.equal(s.vote?.passing, false);
});

test("formatEth and parseEthToWei round trip without float math", () => {
  assert.equal(formatEth(6_000_000_000_000_000n), "0.006");
  assert.equal(formatEth("1000000000000000000"), "1");
  assert.equal(parseEthToWei("0.006"), 6_000_000_000_000_000n);
  assert.equal(parseEthToWei("0"), null);
  assert.equal(parseEthToWei("-1"), null);
  assert.equal(parseEthToWei("1e3"), null);
  assert.equal(parseEthToWei("0.0000000000000000001"), null);
});

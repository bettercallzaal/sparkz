import { test } from "node:test";
import assert from "node:assert/strict";
import { poidhBountyUrl, poidhUrlId, POIDH_BASE_LAST_PRE_V3_BOUNTY } from "./abi";
import { readBounty } from "./client";

const ZERO = "0x0000000000000000000000000000000000000000";
const ISSUER = "0x7234c36a00000000000000000000000000e9af00";

// A fake Base client: just enough of readContract for one open bounty, no network.
function fakeClient(onChainId: bigint) {
  return {
    async readContract({ functionName }: { functionName: string }) {
      switch (functionName) {
        case "getBountiesLength":
          return onChainId + 10n;
        case "bounties":
          return [onChainId, ISSUER, "Design the Zoostr logo. Best one wins.", "desc", 2_000_000_000_000_000n, ZERO, 1_764_000_000n, 0n];
        case "bountyCurrentVotingClaim":
          return 0n;
        case "bountyVotingTracker":
          return [0n, 0n, 0n];
        case "getClaimsByBountyId":
          return [];
        case "getParticipantsPaged":
          return [[ISSUER], [2_000_000_000_000_000n]];
        default:
          throw new Error(`unexpected read ${functionName}`);
      }
    },
  };
}

test("on-chain id 582 (the Zoostr bounty) links to poidh.xyz URL id 1568", async () => {
  // Checked live: poidh.xyz/bounties/data lists id 1568 with onChainId 582.
  const b = await readBounty(582n, fakeClient(582n) as never);
  assert.ok(b);
  assert.equal(b.id, "582", "the on-chain id is kept as is");
  assert.equal(b.url, "https://poidh.xyz/base/bounty/1568");
});

test("a v3 on-chain id never equals its poidh.xyz URL id", () => {
  for (const onChainId of [0n, 1n, 582n, 5000n]) {
    assert.notEqual(poidhUrlId(onChainId), onChainId.toString());
    assert.equal(poidhUrlId(onChainId), (onChainId + 986n).toString());
  }
});

test("the poidh URL id offset is poidh's own Base pre-v3 boundary (986)", () => {
  assert.equal(POIDH_BASE_LAST_PRE_V3_BOUNTY, 986);
  assert.equal(poidhUrlId(42), "1028");
  assert.equal(poidhBountyUrl(582n), "https://poidh.xyz/base/bounty/1568");
});

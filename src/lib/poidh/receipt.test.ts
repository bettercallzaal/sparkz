import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeEventTopics, encodeAbiParameters, parseAbi, type Hex } from "viem";
import { poidhAbi, POIDH_CONTRACT_ADDRESS } from "./abi";
import { parseCreatedBounty, type ReceiptLike } from "./receipt";

const abi = parseAbi(poidhAbi);
const WALLET = "0x1111111111111111111111111111111111111111";
const OTHER = "0x2222222222222222222222222222222222222222";

function created(issuer: string, open = true): ReceiptLike["logs"][number] {
  const topics = encodeEventTopics({ abi, eventName: "BountyCreated", args: { id: 5n, issuer: issuer as Hex } }) as Hex[];
  const data = encodeAbiParameters(
    [{ type: "string" }, { type: "string" }, { type: "uint256" }, { type: "uint256" }, { type: "bool" }, { type: "uint256" }],
    ["Zoostr logo", "Draw it", 6_000_000_000_000_000n, 1_700_000_000n, open, 0n],
  );
  return { address: POIDH_CONTRACT_ADDRESS, data, topics };
}
const receipt = (over: Partial<ReceiptLike> = {}): ReceiptLike => ({
  status: "success", from: WALLET, to: POIDH_CONTRACT_ADDRESS, logs: [created(WALLET)], ...over,
});

test("a successful createOpenBounty from the sender parses", () => {
  const r = parseCreatedBounty(receipt());
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.bounty.bountyId, "5");
    assert.equal(r.bounty.amountWei, "6000000000000000");
    assert.equal(r.bounty.name, "Zoostr logo");
  }
});

test("reverted, wrong target, other issuer, solo bounty and no event are all refused", () => {
  assert.equal(parseCreatedBounty(receipt({ status: "reverted" })).ok, false);
  assert.equal(parseCreatedBounty(receipt({ to: OTHER })).ok, false);
  assert.equal(parseCreatedBounty(receipt({ to: null })).ok, false);
  assert.equal(parseCreatedBounty(receipt({ from: OTHER })).ok, false);
  assert.equal(parseCreatedBounty(receipt({ logs: [created(WALLET, false)] })).ok, false);
  assert.equal(parseCreatedBounty(receipt({ logs: [] })).ok, false);
  assert.equal(parseCreatedBounty(receipt({ logs: [{ ...created(WALLET), address: OTHER }] })).ok, false);
});

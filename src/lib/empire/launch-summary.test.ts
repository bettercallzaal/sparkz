import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPIRE_FEE_WALLET, summarizeTokenConfig, tokenFromReceipt } from "./launch-summary";

const me = "0x1111111111111111111111111111111111111111";
const empire = EMPIRE_FEE_WALLET;
const stranger = "0x2222222222222222222222222222222222222222";

const config = {
  name: "Zoostr",
  symbol: "ZOOSTR",
  image: "https://example.com/z.png",
  tokenAdmin: me,
  fees: { type: "dynamic", baseFee: 100, maxFee: 220 },
  vault: { percentage: 30, lockupDuration: 30 * 86400, vestingDuration: 0 },
  rewards: {
    recipients: [
      { admin: me, recipient: me, bps: 8000, token: "Both" },
      { admin: empire, recipient: empire, bps: 2000, token: "Both" },
    ],
  },
};

test("shares are shown after Clanker's 20%: creator 64%, Empire 16%", () => {
  const s = summarizeTokenConfig(config, { creator: me });
  assert.equal(s.clankerPct, 20);
  assert.deepEqual(s.recipients.map((r) => r.pctOfTradingFees), [64, 16]);
  assert.deepEqual(s.problems, []);
  assert.equal(s.vaultPct, 30);
  assert.equal(s.vaultLockDays, 30);
  assert.equal(s.supply, 100_000_000_000);
});

test("a token admin that is not the connected wallet blocks the launch", () => {
  const s = summarizeTokenConfig({ ...config, tokenAdmin: empire }, { creator: me });
  assert.ok(s.problems.some((p) => p.includes("Token admin")));
});

test("an unexplained third recipient blocks the launch", () => {
  const extra = {
    ...config,
    rewards: {
      recipients: [
        { admin: me, recipient: me, bps: 7000 },
        { admin: empire, recipient: empire, bps: 2000 },
        { admin: empire, recipient: "0x3333333333333333333333333333333333333333", bps: 1000 },
      ],
    },
  };
  const s = summarizeTokenConfig(extra, { creator: me });
  assert.ok(s.problems.some((p) => p.includes("somewhere other")));
});

test("Empire's real split, creator 6000 + 2000 and Empire 2000, passes", () => {
  const real = {
    ...config,
    rewards: {
      recipients: [
        { admin: me, recipient: me, bps: 6000 },
        { admin: me, recipient: me, bps: 2000 },
        { admin: empire, recipient: empire, bps: 2000 },
      ],
    },
  };
  const s = summarizeTokenConfig(real, { creator: me });
  assert.deepEqual(s.problems, []);
  assert.deepEqual(s.recipients.map((r) => r.pctOfTradingFees), [48, 16, 16]);
});

test("a stranger at 2000 bps instead of Empire is refused, with no wallet passed in (review round 2, item 1)", () => {
  const swapped = {
    ...config,
    rewards: {
      recipients: [
        { admin: me, recipient: me, bps: 8000 },
        { admin: stranger, recipient: stranger, bps: 2000 },
      ],
    },
  };
  const s = summarizeTokenConfig(swapped, { creator: me });
  assert.ok(s.problems.some((p) => p.includes("neither you nor Empire")));
  assert.ok(s.problems.some((p) => p.includes("Empire's fee share")));
});

test("a second recipient at 2000 bps next to Empire is refused", () => {
  const extra = {
    ...config,
    rewards: {
      recipients: [
        { admin: me, recipient: me, bps: 6000 },
        { admin: empire, recipient: empire, bps: 2000 },
        { admin: stranger, recipient: stranger, bps: 2000 },
      ],
    },
  };
  assert.ok(summarizeTokenConfig(extra, { creator: me }).problems.length > 0);
});

test("shares that do not add to 10000 bps block the launch", () => {
  const bad = { ...config, rewards: { recipients: [{ admin: me, recipient: me, bps: 9000 }] } };
  assert.ok(summarizeTokenConfig(bad, { creator: me }).problems.some((p) => p.includes("10000")));
});

test("a dev buy in the config blocks the launch", () => {
  const s = summarizeTokenConfig({ ...config, devBuy: { ethAmount: 0.1 } }, { creator: me });
  assert.ok(s.devBuy);
  assert.ok(s.problems.length > 0);
});

test("the token is the contract that minted from the zero address", () => {
  const T = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const Z = "0x" + "0".repeat(64);
  const logs = [
    { address: "0xaaaa", topics: [T, "0x" + "1".repeat(64)] },
    { address: "0xtoken", topics: [T, Z] },
  ];
  assert.equal(tokenFromReceipt(logs), "0xtoken");
  assert.equal(tokenFromReceipt([]), null);
});

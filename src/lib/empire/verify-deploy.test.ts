import { test } from "node:test";
import assert from "node:assert/strict";
import { deployTxProblem } from "./verify-deploy";

const ME = "0x1111111111111111111111111111111111111111";
const TOKEN = "0x4444444444444444444444444444444444444b07";
const FACTORY = "0xE85A59c628F7d27878ACeB4bf3b35733630083a9";
const mint = [
  {
    address: TOKEN,
    topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "0x" + "0".repeat(64)],
  },
];
const good = { found: true, status: "success" as const, from: ME, to: FACTORY, logs: mint };

test("a tx from the owner to the factory that minted this coin passes", () => {
  assert.equal(deployTxProblem(good, { owner: ME, baseToken: TOKEN }), null);
});

test("not mined, reverted, wrong sender, wrong contract or wrong coin are each refused", () => {
  const e = { owner: ME, baseToken: TOKEN };
  const someone = "0x2222222222222222222222222222222222222222";
  assert.ok(deployTxProblem({ found: false }, e));
  assert.ok(deployTxProblem({ ...good, status: "reverted" }, e));
  assert.ok(deployTxProblem({ ...good, from: someone }, e));
  assert.ok(deployTxProblem({ ...good, to: someone }, e));
  assert.ok(deployTxProblem(good, { owner: ME, baseToken: "0x5555555555555555555555555555555555555555" }));
});

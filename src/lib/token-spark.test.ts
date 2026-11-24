import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTokenSparkRows,
  clankerUrl,
  percentOf,
  readTokenSpark,
  readTokenSparkChain,
  type ChainReader,
  type TokenSparkMeta,
} from "./token-spark";

const TOKEN = "0xbB48f19B0494Ff7C1fE5Dc2032aeEE14312f0b07";
const ADMIN = "0x7234c36A71ec237c2Ae7698e8916e0735001E9Af";
const OTHER = "0xAFB6662d73e8f9Ce3fB1Baac2F280dAFaeD6885B";
const E18 = BigInt(10) ** BigInt(18);
const SUPPLY = BigInt(100_000_000_000) * E18;
const VAULT = BigInt(30_000_000_000) * E18;
const LOCK_END = 1772467217;

const meta = readTokenSpark("zabal", {}) as TokenSparkMeta;

// A reader that answers the way the Base contracts answered on 24 Nov 2026.
const goodReader: ChainReader = {
  async readContract({ functionName }) {
    switch (functionName) {
      case "name":
      case "symbol":
        return "ZABAL";
      case "decimals":
        return 18;
      case "totalSupply":
        return SUPPLY;
      case "admin":
        return ADMIN;
      case "allocation":
        return [TOKEN, VAULT, VAULT, BigInt(LOCK_END), BigInt(LOCK_END), ADMIN];
      case "tokenRewards":
        return { rewardBps: [8000, 2000], rewardAdmins: [ADMIN, OTHER], rewardRecipients: [ADMIN, OTHER] };
      default:
        throw new Error("unexpected call");
    }
  },
};

test("ZABAL reads as a token Spark with no metadata stored on the row", () => {
  assert.equal(meta.kind, "token");
  assert.equal(meta.token_address, TOKEN);
  assert.equal(readTokenSpark("some-other-hearth", {}), null);
});

test("a row's own metadata.spark wins, and a malformed one falls back instead of throwing", () => {
  const own = { spark: { kind: "token", token_address: OTHER } };
  assert.equal(readTokenSpark("zabal", own)?.token_address, OTHER);
  assert.equal(readTokenSpark("zabal", { spark: { kind: "token", token_address: "nope" } })?.token_address, TOKEN);
  assert.equal(readTokenSpark("x", { spark: { kind: "nft-drop" } }), null);
  assert.equal(readTokenSpark("x", null), null);
});

test("chain read fills token, vault and locker recipients", async () => {
  const c = await readTokenSparkChain(meta, goodReader);
  assert.equal(c.token?.symbol, "ZABAL");
  assert.equal(c.vault?.amountTotal, VAULT);
  assert.deepEqual(c.rewards?.map((r) => r.bps), [8000, 2000]);
});

test("one failing call blanks only its section", async () => {
  const reader: ChainReader = {
    async readContract(a) {
      if (a.functionName === "tokenRewards") throw new Error("rpc down");
      return goodReader.readContract(a);
    },
  };
  const c = await readTokenSparkChain(meta, reader);
  assert.ok(c.token);
  assert.ok(c.vault);
  assert.equal(c.rewards, null);
});

test("an empty vault allocation is not shown as a vault", async () => {
  const reader: ChainReader = {
    async readContract(a) {
      if (a.functionName === "allocation") {
        return ["0x0000000000000000000000000000000000000000", BigInt(0), BigInt(0), BigInt(0), BigInt(0), "0x0000000000000000000000000000000000000000"];
      }
      return goodReader.readContract(a);
    },
  };
  assert.equal((await readTokenSparkChain(meta, reader)).vault, null);
});

test("rows: vault is 30% of supply, lock date from chain, wording rules hold", async () => {
  const c = await readTokenSparkChain(meta, goodReader);
  const rows = buildTokenSparkRows(meta, c, 1_800_000_000);
  const byLabel = Object.fromEntries(rows.map((r) => [r.label, r]));
  assert.match(byLabel["Community vault"].value, /30,000,000,000 ZABAL \(30% of supply\)/);
  assert.match(byLabel["Vault lock"].value, /^ended 2026-03-02/);
  assert.equal(byLabel["ZAO teammates, 1%"].source, "planned");
  assert.equal(byLabel["Cashless man, 1%"].source, "planned");
  assert.equal(byLabel["Airdrop share"].source, "pending");
  const text = rows.map((r) => `${r.label} ${r.value}`).join(" ").toLowerCase();
  for (const banned of ["creator vault", "earn", "pays", "payout", "splits.org", "share fees"]) {
    assert.ok(!text.includes(banned), `row text must not contain "${banned}"`);
  }
});

test("rows: a failed read says not read from chain yet and invents no number", () => {
  const rows = buildTokenSparkRows(meta, { token: null, vault: null, rewards: null }, 0);
  for (const r of rows.filter((x) => x.source !== "planned")) {
    assert.equal(r.value.includes("0"), false, `${r.label} must carry no number: ${r.value}`);
    assert.equal(r.value, "not read from chain yet");
  }
});

test("percentOf and the Clanker link", () => {
  assert.equal(percentOf(BigInt(1), BigInt(3)), "33.33%");
  assert.equal(percentOf(BigInt(1), BigInt(0)), null);
  assert.equal(clankerUrl(TOKEN), `https://www.clanker.world/clanker/${TOKEN}`);
});

import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { encodeEventTopics, encodeAbiParameters, parseAbi, type Hex } from "viem";
import { SESSION_COOKIE, mintSession } from "@/lib/session";
import { setServiceClientForTests } from "@/lib/supabase/server";
import { fakeClient, type FakeTables } from "@/lib/db/fake-client";
import { setBaseClientForTests } from "@/lib/poidh/client";
import { poidhAbi, POIDH_CONTRACT_ADDRESS } from "@/lib/poidh/abi";

const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const OWNER = 5000;
const STRANGER = 6000;
const HEARTH = "11111111-1111-4111-8111-111111111111";
const WALLET = "0x1111111111111111111111111111111111111111";
const OTHER_WALLET = "0x2222222222222222222222222222222222222222";
const ADMIN = 19640; // in ADMIN_FIDS: the operator
const HASH = "0x" + "ab".repeat(32);
const abi = parseAbi(poidhAbi);

let tables: FakeTables;
// The Hearth owner's Farcaster primary address on the Hypersnap node (stubbed fetch), or
// null when the node is down.
let ownerPrimary: string | null;
const realFetch = globalThis.fetch;
after(() => {
  globalThis.fetch = realFetch;
});
let rec: { status: string; from: string; to: string | null; logs: unknown[] } | "pending";

function goodLog(issuer: string = WALLET) {
  const topics = encodeEventTopics({ abi, eventName: "BountyCreated", args: { id: 9n, issuer: issuer as Hex } }) as Hex[];
  const data = encodeAbiParameters(
    [{ type: "string" }, { type: "string" }, { type: "uint256" }, { type: "uint256" }, { type: "bool" }, { type: "uint256" }],
    ["t", "d", 6_000_000_000_000_000n, 1n, true, 0n],
  );
  return { address: POIDH_CONTRACT_ADDRESS, data, topics };
}

beforeEach(() => {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  tables = { hearths: [{ id: HEARTH, slug: "zoostr", owner_fid: OWNER }], hearth_bounties: [] };
  setServiceClientForTests(fakeClient(tables));
  ownerPrimary = WALLET;
  globalThis.fetch = (async (input: string | URL | Request) => {
    if (ownerPrimary === null) throw new Error("node down");
    const u = new URL(String(input instanceof Request ? input.url : input));
    const fid = Number(u.searchParams.get("fid"));
    const messages =
      u.pathname.endsWith("/v1/userDataByFid") && fid === OWNER
        ? [
            { hash: "0x1", data: { type: "MESSAGE_TYPE_USER_DATA_ADD", fid, timestamp: 1, network: "x", userDataBody: { type: "USER_DATA_TYPE_USERNAME", value: "owner" } } },
            { hash: "0x2", data: { type: "MESSAGE_TYPE_USER_DATA_ADD", fid, timestamp: 1, network: "x", userDataBody: { type: "USER_DATA_PRIMARY_ADDRESS_ETHEREUM", value: ownerPrimary } } },
          ]
        : [];
    return new Response(JSON.stringify({ messages }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  rec = { status: "success", from: WALLET, to: POIDH_CONTRACT_ADDRESS, logs: [goodLog()] };
  setBaseClientForTests({
    getTransactionReceipt: async () => {
      if (rec === "pending") throw new Error("not found");
      return rec;
    },
  });
});

function post(opts: { fid?: number; body?: unknown } = {}) {
  const h = new Headers({ "content-type": "application/json", origin: "https://trysparkz.com", "sec-fetch-site": "same-origin" });
  if (opts.fid) h.set("cookie", `${SESSION_COOKIE}=${mintSession(opts.fid)}`);
  return new NextRequest("https://trysparkz.com/api/hearth-bounties", {
    method: "POST", headers: h, body: JSON.stringify(opts.body ?? { hearth_id: HEARTH, tx_hash: HASH }),
  });
}

test("signed out is 401 and saves nothing", async () => {
  const { POST } = await import("./route");
  assert.equal((await POST(post())).status, 401);
  assert.equal(tables.hearth_bounties.length, 0);
});

test("a non-owner is 403", async () => {
  const { POST } = await import("./route");
  assert.equal((await POST(post({ fid: STRANGER }))).status, 403);
  assert.equal(tables.hearth_bounties.length, 0);
});

test("bad body is 400", async () => {
  const { POST } = await import("./route");
  assert.equal((await POST(post({ fid: OWNER, body: { hearth_id: HEARTH, tx_hash: "0x1" } }))).status, 400);
});

test("a pending or unknown receipt is 400, never saved", async () => {
  const { POST } = await import("./route");
  rec = "pending";
  assert.equal((await POST(post({ fid: OWNER }))).status, 400);
  assert.equal(tables.hearth_bounties.length, 0);
});

test("a receipt to the wrong address is 400", async () => {
  const { POST } = await import("./route");
  rec = { status: "success", from: WALLET, to: "0x2222222222222222222222222222222222222222", logs: [goodLog()] };
  assert.equal((await POST(post({ fid: OWNER }))).status, 400);
  assert.equal(tables.hearth_bounties.length, 0);
});

test("the owner records a real bounty once; a repeat is deduped", async () => {
  const { POST } = await import("./route");
  const first = await POST(post({ fid: OWNER }));
  assert.equal(first.status, 201);
  assert.equal(tables.hearth_bounties.length, 1);
  assert.equal(tables.hearth_bounties[0].bounty_id, "9");
  const again = await POST(post({ fid: OWNER }));
  assert.equal(again.status, 200);
  assert.equal(tables.hearth_bounties.length, 1);
});

// The bounty must come from a wallet the Hearth owner controls, not just any wallet: the
// caller owning the Hearth is not enough, or an owner could put someone else's bounty on
// their Hearth.
test("a bounty created by a wallet the owner does not control is 403 and saves nothing", async () => {
  const { POST } = await import("./route");
  rec = { status: "success", from: OTHER_WALLET, to: POIDH_CONTRACT_ADDRESS, logs: [goodLog(OTHER_WALLET)] };
  const res = await POST(post({ fid: OWNER }));
  assert.equal(res.status, 403);
  assert.equal(tables.hearth_bounties.length, 0);
});

test("the Hearth's own owner_wallet counts, even with the node down", async () => {
  const { POST } = await import("./route");
  ownerPrimary = null;
  tables.hearths[0].owner_wallet = OTHER_WALLET.toUpperCase().replace("0X", "0x");
  rec = { status: "success", from: OTHER_WALLET, to: POIDH_CONTRACT_ADDRESS, logs: [goodLog(OTHER_WALLET)] };
  assert.equal((await POST(post({ fid: OWNER }))).status, 201);
  assert.equal(tables.hearth_bounties.length, 1);
});

test("with the node down and no owner_wallet, nothing can be matched: 403, fails closed", async () => {
  const { POST } = await import("./route");
  ownerPrimary = null;
  assert.equal((await POST(post({ fid: OWNER }))).status, 403);
  assert.equal(tables.hearth_bounties.length, 0);
});

test("the operator can record a bounty from any wallet", async () => {
  const { POST } = await import("./route");
  rec = { status: "success", from: OTHER_WALLET, to: POIDH_CONTRACT_ADDRESS, logs: [goodLog(OTHER_WALLET)] };
  assert.equal((await POST(post({ fid: ADMIN }))).status, 201);
  assert.equal(tables.hearth_bounties.length, 1);
});

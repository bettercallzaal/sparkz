import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { launchDeps } from "@/lib/empire/launch-deps";
import { EMPIRE_FEE_WALLET } from "@/lib/empire/launch-summary";
import { SESSION_COOKIE, mintSession } from "@/lib/session";
import { setServiceClientForTests } from "@/lib/supabase/server";

// Route tests for the token launch (review round 2, item 6): not the owner, refused
// Hearth, bad input, Empire down, and a double launch. Outside calls are faked through
// launchDeps; the routes' own logic runs for real.

const HEARTH = "11111111-2222-4333-8444-555555555555";
const ME = "0x1111111111111111111111111111111111111111";
const OTHER = "0x3333333333333333333333333333333333333333";
const TOKEN = "0x4444444444444444444444444444444444444b07";
const TX = "0x" + "ab".repeat(32);
const FACTORY = "0xE85A59c628F7d27878ACeB4bf3b35733630083a9";
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const goodConfig = {
  name: "Zoostr",
  symbol: "ZOOSTR",
  image: "https://example.com/z.png",
  tokenAdmin: ME,
  rewards: {
    recipients: [
      { admin: ME, recipient: ME, bps: 8000 },
      { admin: EMPIRE_FEE_WALLET, recipient: EMPIRE_FEE_WALLET, bps: 2000 },
    ],
  },
};

type Row = Record<string, unknown>;

// A tiny stand-in for the Supabase query builder: reads return the one Hearth, updates
// merge into it (unless the test makes the compare-and-set lose).
function fakeDb(hearth: Row) {
  const state = { hearth: { ...hearth } as Row, loseClaim: false, failSave: false };
  const from = () => {
    let update: Row | null = null;
    const q = {
      select: () => q,
      eq: () => q,
      is: () => q,
      update: (p: Row) => {
        update = p;
        return q;
      },
      maybeSingle: async () => ({ data: state.hearth, error: null }),
      single: async () => {
        if (state.failSave) return { data: null, error: { message: "db write failed" } };
        state.hearth = { ...state.hearth, ...(update ?? {}) };
        return { data: state.hearth, error: null };
      },
      then: (res: (v: unknown) => void) => {
        if (!update) return res({ data: [state.hearth], error: null });
        if (state.loseClaim) return res({ data: [], error: null });
        // Like the real filter on register-token's claim: a claim already taken, or a coin
        // already recorded, matches no row.
        const cur = (state.hearth.economic_config ?? {}) as Row;
        const next = ((update as Row).economic_config ?? {}) as Row;
        if (next.token_launch_claimed_at && (cur.token_launch_claimed_at || cur.token_address)) {
          return res({ data: [], error: null });
        }
        state.hearth = { ...state.hearth, ...update };
        return res({ data: [{ id: HEARTH }], error: null });
      },
    };
    return q;
  };
  return { state, client: { from } };
}

const saved = { ...launchDeps };
let db: ReturnType<typeof fakeDb>;
let empireCalls = 0;
const econ = () => db.state.hearth.economic_config as Row;

beforeEach(() => {
  db = fakeDb({ id: HEARTH, owner_fid: 1, metadata: {}, economic_config: {} });
  empireCalls = 0;
  Object.assign(launchDeps, {
    requireHearthOwner: async () => null,
    // Token launch is operator-only for now, so the default caller here is the operator.
    // The tests that call useRealAuth() use real sessions and the real admin check instead.
    isAdmin: () => true,
    getServiceClient: () => db.client,
    getTokenConfig: async () => {
      empireCalls++;
      return { tokenConfig: goodConfig, raw: {} };
    },
    registerTokenEmpire: async () => {
      empireCalls++;
      return { empireAddress: "0x5555555555555555555555555555555555555555" };
    },
    readDeployTx: async () => ({
      found: true,
      status: "success",
      from: ME,
      to: FACTORY,
      logs: [{ address: TOKEN, topics: [TRANSFER, "0x" + "0".repeat(64)] }],
    }),
    now: () => Date.parse("2026-11-25T00:00:00Z"),
  });
});
afterEach(() => {
  Object.assign(launchDeps, saved);
  setServiceClientForTests(null);
});

const req = (path: string, body: unknown) =>
  new NextRequest(`https://trysparkz.com${path}`, { method: "POST", body: JSON.stringify(body) });

// Real sessions and the real auth checks: the owner gate and the admin check run as in
// production, reading the fake database through setServiceClientForTests.
const SESSION_KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const OWNER_FID = 1; // owner_fid of the fake Hearth, not an admin fid
const OPERATOR_FID = 19640; // in ADMIN_FIDS
function useRealAuth() {
  process.env.SPARKZ_SESSION_SECRET = SESSION_KEY;
  setServiceClientForTests(db.client);
  Object.assign(launchDeps, { requireHearthOwner: saved.requireHearthOwner, isAdmin: saved.isAdmin });
}
const sessionReq = (path: string, body: unknown, fid: number) =>
  new NextRequest(`https://trysparkz.com${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { cookie: `${SESSION_COOKIE}=${mintSession(fid)}` },
  });
const configBody = (creator = ME) => ({
  hearth_id: HEARTH,
  name: "Zoostr",
  symbol: "ZOOSTR",
  image_url: "https://example.com/z.png",
  creator,
});
const registerBody = (owner = ME) => ({
  hearth_id: HEARTH,
  base_token: TOKEN,
  tx_hash: TX,
  owner,
  name: "Zoostr",
  symbol: "ZOOSTR",
});

test("not the owner: 401 before any database or Empire call", async () => {
  Object.assign(launchDeps, { requireHearthOwner: saved.requireHearthOwner }); // real check, no session
  const { POST } = await import("./token-config/route");
  const res = await POST(req("/api/empire/token-config", configBody()));
  assert.equal(res.status, 401);
  assert.equal(empireCalls, 0);
});

test("bad input: 400", async () => {
  const { POST } = await import("./token-config/route");
  const res = await POST(req("/api/empire/token-config", { ...configBody(), creator: "zaal.eth" }));
  assert.equal(res.status, 400);
  assert.equal(empireCalls, 0);
});

test("refused Hearth (already has a token): 409, Empire never asked", async () => {
  db.state.hearth.economic_config = { token_address: TOKEN };
  const { POST } = await import("./token-config/route");
  const res = await POST(req("/api/empire/token-config", configBody()));
  assert.equal(res.status, 409);
  assert.equal(empireCalls, 0);
});

test("happy path: config handed out and the lock is taken before any wallet sends", async () => {
  const { POST } = await import("./token-config/route");
  const res = await POST(req("/api/empire/token-config", configBody()));
  assert.equal(res.status, 200);
  assert.equal(econ().token_launch_lock_by, ME.toLowerCase());
  assert.equal(typeof econ().token_launch_lock_at, "string");
});

test("Empire down: 502 with a plain message, Empire's raw text never sent", async () => {
  launchDeps.getTokenConfig = async () => {
    throw new Error("internal: key abc123 rejected by upstream");
  };
  const { POST } = await import("./token-config/route");
  const res = await POST(req("/api/empire/token-config", configBody()));
  assert.equal(res.status, 502);
  assert.ok(!JSON.stringify(await res.json()).includes("abc123"));
});

test("Empire's config paying a stranger is refused on the server", async () => {
  launchDeps.getTokenConfig = async () => ({
    tokenConfig: {
      ...goodConfig,
      rewards: {
        recipients: [
          { admin: ME, recipient: ME, bps: 8000 },
          { admin: OTHER, recipient: OTHER, bps: 2000 },
        ],
      },
    },
    raw: {},
  });
  const { POST } = await import("./token-config/route");
  const res = await POST(req("/api/empire/token-config", configBody()));
  assert.equal(res.status, 502);
});

test("double launch: a second wallet cannot take the lock while the first holds it", async () => {
  const { POST } = await import("./token-config/route");
  assert.equal((await POST(req("/api/empire/token-config", configBody(ME)))).status, 200);
  assert.equal((await POST(req("/api/empire/token-config", configBody(OTHER)))).status, 409);
});

test("double launch: once a tx is recorded, no second config is handed out", async () => {
  db.state.hearth.economic_config = {
    pending_deploy_tx: TX,
    token_launch_lock_at: "2026-11-25T00:00:00Z",
    token_launch_lock_by: ME.toLowerCase(),
  };
  const { POST } = await import("./token-config/route");
  assert.equal((await POST(req("/api/empire/token-config", configBody()))).status, 409);
  assert.equal(empireCalls, 0);
});

test("token-pending refuses a tx for a launch that was never prepared", async () => {
  const { POST } = await import("./token-pending/route");
  const res = await POST(req("/api/empire/token-pending", { hearth_id: HEARTH, tx_hash: TX }));
  assert.equal(res.status, 409);
});

test("register: the server reads the tx and refuses one sent from another wallet", async () => {
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_lock_by: ME.toLowerCase() };
  launchDeps.readDeployTx = async () => ({ found: true, status: "success", from: OTHER, to: FACTORY, logs: [] });
  const { POST } = await import("./register-token/route");
  const res = await POST(req("/api/empire/register-token", registerBody()));
  assert.equal(res.status, 409);
  assert.equal(empireCalls, 0);
});

test("register: happy path records the token; a second register is refused", async () => {
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_lock_by: ME.toLowerCase() };
  const { POST } = await import("./register-token/route");
  assert.equal((await POST(req("/api/empire/register-token", registerBody()))).status, 201);
  assert.equal(econ().token_address, TOKEN);
  assert.equal((await POST(req("/api/empire/register-token", registerBody()))).status, 409);
  assert.equal(empireCalls, 1);
});

test("register: Empire down gives a plain 502 and frees the claim", async () => {
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_lock_by: ME.toLowerCase() };
  launchDeps.registerTokenEmpire = async () => {
    throw new Error("upstream secret detail xyz789");
  };
  const { POST } = await import("./register-token/route");
  const res = await POST(req("/api/empire/register-token", registerBody()));
  assert.equal(res.status, 502);
  assert.ok(!JSON.stringify(await res.json()).includes("xyz789"));
  assert.equal(econ().token_launch_claimed_at, undefined);
});

test("register: the operator gets no skip of the one-launch claim", async () => {
  launchDeps.isAdmin = () => true;
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_lock_by: ME.toLowerCase() };
  db.state.loseClaim = true;
  const { POST } = await import("./register-token/route");
  assert.equal((await POST(req("/api/empire/register-token", registerBody()))).status, 409);
  assert.equal(empireCalls, 0);
});

// Round 3, item 1: the registered owner is tied to the wallet that took the launch lock.
test("register: no launch lock and a different owner is refused before any chain or Empire call", async () => {
  db.state.hearth.economic_config = { pending_deploy_tx: TX };
  let reads = 0;
  launchDeps.readDeployTx = async () => {
    reads++;
    return { found: true, status: "success", from: OTHER, to: FACTORY, logs: [{ address: TOKEN, topics: [TRANSFER, "0x" + "0".repeat(64)] }] };
  };
  const { POST } = await import("./register-token/route");
  const res = await POST(req("/api/empire/register-token", registerBody(OTHER)));
  assert.equal(res.status, 409);
  assert.equal(reads, 0);
  assert.equal(empireCalls, 0);
  assert.equal(econ().token_address, undefined);
});

test("register: a lock held by another wallet is refused", async () => {
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_lock_by: ME.toLowerCase() };
  const { POST } = await import("./register-token/route");
  assert.equal((await POST(req("/api/empire/register-token", registerBody(OTHER)))).status, 409);
  assert.equal(empireCalls, 0);
});

// Post-merge review of #430: the recorded deploy tx is mandatory. No pending tx means refused
// before the chain is read, even when the lock and the owner match.
test("register: no recorded pending tx is refused before any chain or Empire call", async () => {
  db.state.hearth.economic_config = { token_launch_lock_by: ME.toLowerCase() };
  let reads = 0;
  launchDeps.readDeployTx = async () => {
    reads++;
    return { found: true, status: "success", from: ME, to: FACTORY, logs: [] };
  };
  const { POST } = await import("./register-token/route");
  const res = await POST(req("/api/empire/register-token", registerBody()));
  assert.equal(res.status, 409);
  assert.equal(reads, 0);
  assert.equal(empireCalls, 0);
  assert.equal(econ().token_address, undefined);
});

// The lock holder is the wallet the launch is tied to. A tx sent from any other wallet is refused,
// even when the browser names that other wallet as owner.
test("register: tx.from that differs from the lock holder is refused", async () => {
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_lock_by: OTHER.toLowerCase() };
  launchDeps.readDeployTx = async () => ({ found: true, status: "success", from: ME, to: FACTORY, logs: [] });
  const { POST } = await import("./register-token/route");
  const res = await POST(req("/api/empire/register-token", registerBody(OTHER)));
  assert.equal(res.status, 409);
  assert.equal(empireCalls, 0);
  assert.equal(econ().token_address, undefined);
});

// Round 3: a signed-in user who is not the Hearth's owner gets 403 from the REAL owner gate
// (requireHearthOwner and isAdmin from src/lib/auth.ts, a real session cookie for another fid,
// the fake database injected with setServiceClientForTests), and the route does nothing after it.
test("register: a signed-in non-owner gets 403 from the real owner gate, before any chain or Empire call", async () => {
  useRealAuth();
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_lock_by: ME.toLowerCase() };
  let reads = 0;
  launchDeps.readDeployTx = async () => {
    reads++;
    return { found: true, status: "success", from: ME, to: FACTORY, logs: [] };
  };
  const { POST } = await import("./register-token/route");
  const res = await POST(sessionReq("/api/empire/register-token", registerBody(), OWNER_FID + 1));
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, "Only this Hearth's owner can do that");
  assert.equal(reads, 0);
  assert.equal(empireCalls, 0);
  assert.equal(econ().token_address, undefined);
});

// Round 3, item 2: cross-site refusal on all three routes, before any database or Empire call.
const crossSiteReq = (path: string, body: unknown) =>
  new NextRequest(`https://trysparkz.com${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { origin: "https://evil.example", "sec-fetch-site": "cross-site" },
  });

for (const [name, path, body] of [
  ["token-config", "/api/empire/token-config", configBody()],
  ["token-pending", "/api/empire/token-pending", { hearth_id: HEARTH, tx_hash: TX }],
  ["register-token", "/api/empire/register-token", registerBody()],
] as const) {
  test(`${name}: a cross-site request is refused with 403 before any database or Empire call`, async () => {
    let dbCalls = 0;
    Object.assign(launchDeps, {
      getServiceClient: () => {
        dbCalls++;
        return db.client;
      },
    });
    let ownerChecks = 0;
    launchDeps.requireHearthOwner = async () => {
      ownerChecks++;
      return null;
    };
    const { POST } = await import(`./${name}/route`);
    const res = await POST(crossSiteReq(path, body));
    assert.equal(res.status, 403);
    assert.equal(dbCalls, 0);
    assert.equal(ownerChecks, 0);
    assert.equal(empireCalls, 0);
  });
}

// Round 3, item 2: not the owner gets 401 on token-pending and register-token too.
for (const [name, path, body] of [
  ["token-pending", "/api/empire/token-pending", { hearth_id: HEARTH, tx_hash: TX }],
  ["register-token", "/api/empire/register-token", registerBody()],
] as const) {
  test(`${name}: not the owner gets 401 before any database or Empire call`, async () => {
    Object.assign(launchDeps, { requireHearthOwner: saved.requireHearthOwner }); // real check, no session
    let dbCalls = 0;
    Object.assign(launchDeps, {
      getServiceClient: () => {
        dbCalls++;
        return db.client;
      },
    });
    const { POST } = await import(`./${name}/route`);
    const res = await POST(req(path, body));
    assert.equal(res.status, 401);
    assert.equal(dbCalls, 0);
    assert.equal(empireCalls, 0);
  });
}

// Token launch is operator-only until the wallet is bound to the session. A signed-in owner
// of an approved Hearth who is not the operator is refused at the FIRST step, whatever wallet
// the browser names, and the later steps refuse too. Real session, real owner and admin checks.
const V = "0x9999999999999999999999999999999999999999";
const VTOKEN = "0x8888888888888888888888888888888888888b07";
const VTX = "0x" + "cd".repeat(32);
test("operator-only: a non-operator owner is refused on all three steps, nothing recorded", async () => {
  useRealAuth();
  db.state.hearth.metadata = { self_serve: true, review: "approved" };
  launchDeps.readDeployTx = async (h: string) =>
    h === VTX
      ? { found: true, status: "success", from: V, to: FACTORY, logs: [{ address: VTOKEN, topics: [TRANSFER, "0x" + "0".repeat(64)] }] }
      : { found: false };
  const cfg = await (await import("./token-config/route")).POST(
    sessionReq("/api/empire/token-config", { ...configBody(V), name: "X", symbol: "X" }, OWNER_FID),
  );
  assert.equal(cfg.status, 403);
  assert.equal((await cfg.json()).error, "Token launch is operator-only for now.");
  assert.equal(econ().token_launch_lock_by, undefined);
  const pend = await (await import("./token-pending/route")).POST(
    sessionReq("/api/empire/token-pending", { hearth_id: HEARTH, tx_hash: VTX }, OWNER_FID),
  );
  assert.equal(pend.status, 403);
  assert.equal(econ().pending_deploy_tx, undefined);
  const reg = await (await import("./register-token/route")).POST(
    sessionReq(
      "/api/empire/register-token",
      { hearth_id: HEARTH, base_token: VTOKEN, tx_hash: VTX, owner: V, name: "X", symbol: "X" },
      OWNER_FID,
    ),
  );
  assert.equal(reg.status, 403);
  assert.equal(econ().token_address, undefined);
  assert.equal(empireCalls, 0);
});

test("operator-only: with a lock and a pending tx already set, a non-operator owner cannot record or register", async () => {
  useRealAuth();
  db.state.hearth.economic_config = { token_launch_lock_at: "2026-11-25T00:00:00Z", token_launch_lock_by: ME.toLowerCase() };
  const pend = await (await import("./token-pending/route")).POST(
    sessionReq("/api/empire/token-pending", { hearth_id: HEARTH, tx_hash: TX }, OWNER_FID),
  );
  assert.equal(pend.status, 403);
  assert.equal(econ().pending_deploy_tx, undefined);
  db.state.hearth.economic_config = { ...econ(), pending_deploy_tx: TX };
  const reg = await (await import("./register-token/route")).POST(
    sessionReq("/api/empire/register-token", registerBody(), OWNER_FID),
  );
  assert.equal(reg.status, 403);
  assert.equal(econ().token_address, undefined);
  assert.equal(empireCalls, 0);
});

test("operator happy path: a real operator session runs config, pending and register end to end", async () => {
  useRealAuth();
  const cfg = await (await import("./token-config/route")).POST(
    sessionReq("/api/empire/token-config", configBody(), OPERATOR_FID),
  );
  assert.equal(cfg.status, 200);
  assert.equal(econ().token_launch_lock_by, ME.toLowerCase());
  const pend = await (await import("./token-pending/route")).POST(
    sessionReq("/api/empire/token-pending", { hearth_id: HEARTH, tx_hash: TX }, OPERATOR_FID),
  );
  assert.equal(pend.status, 200);
  assert.equal(econ().pending_deploy_tx, TX);
  const reg = await (await import("./register-token/route")).POST(
    sessionReq("/api/empire/register-token", registerBody(), OPERATOR_FID),
  );
  assert.equal(reg.status, 201);
  assert.equal(econ().token_address, TOKEN);
  assert.equal(empireCalls, 2);
});

test("Empire down at token-config: 502 and the launch lock is released, so a retry is not blocked", async () => {
  const working = launchDeps.getTokenConfig;
  launchDeps.getTokenConfig = async () => {
    throw new Error("empire down");
  };
  const { POST } = await import("./token-config/route");
  assert.equal((await POST(req("/api/empire/token-config", configBody(ME)))).status, 502);
  assert.equal(econ().token_launch_lock_at, undefined);
  assert.equal(econ().token_launch_lock_by, undefined);
  launchDeps.getTokenConfig = working;
  assert.equal((await POST(req("/api/empire/token-config", configBody(ME)))).status, 200);
});

test("refused Empire config at token-config: 502 and the launch lock is released", async () => {
  launchDeps.getTokenConfig = async () => ({ tokenConfig: { ...goodConfig, tokenAdmin: OTHER, rewards: { recipients: [] } }, raw: {} });
  const { POST } = await import("./token-config/route");
  assert.equal((await POST(req("/api/empire/token-config", configBody(ME)))).status, 502);
  assert.equal(econ().token_launch_lock_at, undefined);
});

// ORD-713, H1: the stuck "already in progress" path before FEF launches.
test("H1: while Empire hangs, the claim is held and Finish launch gets 409 (no way out)", async () => {
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_lock_by: ME.toLowerCase() };
  launchDeps.registerTokenEmpire = () => new Promise(() => {}); // never answers
  const { POST } = await import("./register-token/route");
  void POST(req("/api/empire/register-token", registerBody()));
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(typeof econ().token_launch_claimed_at, "string");
  assert.equal(econ().token_address, undefined);
  // A retry while the first call is stuck (or after the platform killed it) is refused.
  assert.equal((await POST(req("/api/empire/register-token", registerBody()))).status, 409);
});

test("H1: the Empire call now has a time limit, so a hang becomes a 502 that frees the claim", async () => {
  const realFetch = globalThis.fetch;
  process.env.EMPIRE_API_KEY = "test-only-not-a-key";
  globalThis.fetch = ((_url: unknown, init?: RequestInit) =>
    new Promise((_res, rej) => init?.signal?.addEventListener("abort", () => rej(init.signal?.reason)))) as typeof fetch;
  try {
    const { registerTokenEmpire } = await import("@/lib/empire/client");
    await assert.rejects(
      registerTokenEmpire({ baseToken: TOKEN, name: "Zoostr", owner: ME, txHash: TX, symbol: "ZOOSTR" }, { timeoutMs: 20 }),
    );
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.EMPIRE_API_KEY;
  }
  // The route's existing catch (Empire down) then frees the claim:
  // see "register: Empire down gives a plain 502 and frees the claim".
});

test("H1: Empire says yes but the save fails: plain 500, Empire asked once, claim kept so it is never asked twice", async () => {
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_lock_by: ME.toLowerCase() };
  db.state.failSave = true;
  const { POST } = await import("./register-token/route");
  const res = await POST(req("/api/empire/register-token", registerBody()));
  assert.equal(res.status, 500);
  assert.match((await res.json()).error, /Do not launch again/);
  assert.equal(empireCalls, 1);
  assert.equal(typeof econ().token_launch_claimed_at, "string");
  assert.equal(econ().token_address, undefined);
  db.state.failSave = false;
  assert.equal((await POST(req("/api/empire/register-token", registerBody()))).status, 409);
  assert.equal(empireCalls, 1);
});

test("H1 recovery: the operator releases a stuck claim, and Finish launch then records the coin", async () => {
  db.state.hearth.economic_config = {
    pending_deploy_tx: TX, token_launch_lock_by: ME.toLowerCase(), token_launch_claimed_at: "2026-11-25T00:00:00.000Z",
  };
  const { POST: release } = await import("./register-token/release/route");
  const rel = await release(req("/api/empire/register-token/release", { hearth_id: HEARTH }));
  assert.equal(rel.status, 200);
  assert.equal(econ().token_launch_claimed_at, undefined);
  assert.equal(econ().pending_deploy_tx, TX); // the same launch, so no second coin
  const { POST } = await import("./register-token/route");
  assert.equal((await POST(req("/api/empire/register-token", registerBody()))).status, 201);
  assert.equal(econ().token_address, TOKEN);
});

test("release: not the operator is 401, and nothing changes", async () => {
  launchDeps.isAdmin = () => false;
  db.state.hearth.economic_config = { pending_deploy_tx: TX, token_launch_claimed_at: "2026-11-25T00:00:00.000Z" };
  const { POST: release } = await import("./register-token/release/route");
  assert.equal((await release(req("/api/empire/register-token/release", { hearth_id: HEARTH }))).status, 401);
  assert.equal(econ().token_launch_claimed_at, "2026-11-25T00:00:00.000Z");
});

test("release: a Hearth whose coin is recorded, or with nothing stuck, is 409", async () => {
  const { POST: release } = await import("./register-token/release/route");
  db.state.hearth.economic_config = { token_address: TOKEN, token_launch_claimed_at: "2026-11-25T00:00:00.000Z" };
  assert.equal((await release(req("/api/empire/register-token/release", { hearth_id: HEARTH }))).status, 409);
  db.state.hearth.economic_config = { pending_deploy_tx: TX };
  assert.equal((await release(req("/api/empire/register-token/release", { hearth_id: HEARTH }))).status, 409);
});

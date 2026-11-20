import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, mintSession } from "@/lib/session";
import { ADMIN_TOKEN_HEADER } from "@/lib/auth";
import { setServiceClientForTests } from "@/lib/supabase/server";
import { fakeClient, type FakeTables } from "@/lib/db/fake-client";

// Who may light and change Sparks, against an in-memory database (src/lib/db/fake-client.ts).
// Review of #418: with both requireHearthOwner calls removed the suite still passed, so the
// auth had no test. These fail when either call is removed.
const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const AGENT = "test-only-agent-token-0123456789"; // throwaway
const OWNER = 5000;
const STRANGER = 6000;
const ADMIN = 19640; // in ADMIN_FIDS (src/lib/admin-identities.ts)
const HEARTH = "11111111-1111-4111-8111-111111111111";
const OTHER_HEARTH = "22222222-2222-4222-8222-222222222222";
const SPARK = "33333333-3333-4333-8333-333333333333";
const RECEIPT_HERE = "44444444-4444-4444-8444-444444444444";
const RECEIPT_ELSEWHERE = "55555555-5555-4555-8555-555555555555";

let tables: FakeTables;

beforeEach(() => {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  process.env.SPARKZ_AGENT_TOKEN = AGENT;
  tables = {
    hearths: [
      { id: HEARTH, slug: "zoostr", owner_fid: OWNER },
      { id: OTHER_HEARTH, slug: "other", owner_fid: STRANGER },
    ],
    sparks: [
      { id: SPARK, hearth_id: HEARTH, kind: "moment", title: "Live one", status: "live", created_at: "2026-11-19T10:00:00Z" },
      { id: crypto.randomUUID(), hearth_id: HEARTH, kind: "event", title: "Planned one", status: "planned", created_at: "2026-11-19T11:00:00Z" },
      { id: crypto.randomUUID(), hearth_id: HEARTH, kind: "bounty", title: "Cancelled one", status: "cancelled", created_at: "2026-11-19T12:00:00Z" },
      { id: crypto.randomUUID(), hearth_id: HEARTH, kind: "nft", title: "Ended one", status: "ended", created_at: "2026-11-19T09:00:00Z" },
    ],
    meme_receipts: [
      { id: RECEIPT_HERE, hearth_id: HEARTH },
      { id: RECEIPT_ELSEWHERE, hearth_id: OTHER_HEARTH },
    ],
  };
  setServiceClientForTests(fakeClient(tables));
});

function req(method: string, opts: { fid?: number; agent?: boolean; body?: unknown; query?: string } = {}) {
  const h = new Headers({ "content-type": "application/json", origin: "https://trysparkz.com", "sec-fetch-site": "same-origin" });
  if (opts.fid) h.set("cookie", `${SESSION_COOKIE}=${mintSession(opts.fid)}`);
  if (opts.agent) h.set(ADMIN_TOKEN_HEADER, AGENT);
  return new NextRequest(`https://trysparkz.com/api/sparks${opts.query ?? ""}`, {
    method,
    headers: h,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

const light = { hearth_id: HEARTH, kind: "moment", title: "Zoostr is lit", status: "live" };

test("POST: signed out is 401 and writes nothing", async () => {
  const { POST } = await import("./route");
  const res = await POST(req("POST", { body: light }));
  assert.equal(res.status, 401);
  assert.equal(tables.sparks.length, 4);
});

test("POST: a signed-in stranger is 403 and writes nothing", async () => {
  const { POST } = await import("./route");
  const res = await POST(req("POST", { fid: STRANGER, body: light }));
  assert.equal(res.status, 403);
  assert.equal(tables.sparks.length, 4);
});

test("POST: the agent token is not admin", async () => {
  const { POST } = await import("./route");
  const res = await POST(req("POST", { agent: true, body: light }));
  assert.equal(res.status, 401);
  assert.equal(tables.sparks.length, 4);
});

test("POST: the owner lights a Spark, stamped with their FID", async () => {
  const { POST } = await import("./route");
  const res = await POST(req("POST", { fid: OWNER, body: light }));
  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.data.created_by_fid, OWNER);
  assert.equal(tables.sparks.length, 5);
});

test("POST: an admin may light a Spark on any Hearth", async () => {
  const { POST } = await import("./route");
  const res = await POST(req("POST", { fid: ADMIN, body: light }));
  assert.equal(res.status, 201);
});

test("POST: a receipt from another Hearth is refused", async () => {
  const { POST } = await import("./route");
  const bad = await POST(req("POST", { fid: OWNER, body: { ...light, receipt_id: RECEIPT_ELSEWHERE } }));
  assert.equal(bad.status, 400);
  const good = await POST(req("POST", { fid: OWNER, body: { ...light, receipt_id: RECEIPT_HERE } }));
  assert.equal(good.status, 201);
});

test("PATCH: signed out 401, stranger 403, agent 401, owner 200", async () => {
  const { PATCH } = await import("./route");
  const body = { id: SPARK, status: "ended" };
  assert.equal((await PATCH(req("PATCH", { body }))).status, 401);
  assert.equal((await PATCH(req("PATCH", { fid: STRANGER, body }))).status, 403);
  assert.equal((await PATCH(req("PATCH", { agent: true, body }))).status, 401);
  assert.equal(tables.sparks.find((s) => s.id === SPARK)?.status, "live");
  assert.equal((await PATCH(req("PATCH", { fid: OWNER, body }))).status, 200);
  assert.equal(tables.sparks.find((s) => s.id === SPARK)?.status, "ended");
});

test("PATCH: a receipt from another Hearth is refused", async () => {
  const { PATCH } = await import("./route");
  const res = await PATCH(req("PATCH", { fid: OWNER, body: { id: SPARK, receipt_id: RECEIPT_ELSEWHERE } }));
  assert.equal(res.status, 400);
});

test("GET: visitors see live and ended only; the owner also sees planned and cancelled", async () => {
  const { GET } = await import("./route");
  const visitor = await (await GET(req("GET", { query: "?slug=zoostr" }))).json();
  assert.deepEqual(visitor.data.map((s: { status: string }) => s.status).sort(), ["ended", "live"]);
  const stranger = await (await GET(req("GET", { fid: STRANGER, query: "?slug=zoostr" }))).json();
  assert.equal(stranger.data.length, 2);
  const owner = await (await GET(req("GET", { fid: OWNER, query: "?slug=zoostr" }))).json();
  assert.equal(owner.data.length, 4);
});

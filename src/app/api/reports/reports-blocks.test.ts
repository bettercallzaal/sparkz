import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, mintSession, mintAddressSession } from "@/lib/session";
import { setServiceClientForTests } from "@/lib/supabase/server";
import { fakeClient, type FakeTables } from "@/lib/db/fake-client";
import { hearthOwnerIdentity, isBlockedHearth, viewerIdentity } from "@/lib/moderation";

// Report and block (migration 0009), against an in-memory database.
const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const ME = 7000;
const OWNER = 8000;
const ADMIN = 19640; // in ADMIN_FIDS (src/lib/admin-identities.ts)
const WALLET = "0x" + "cd".repeat(20);
const HEARTH = "11111111-1111-4111-8111-111111111111";
const MY_HEARTH = "22222222-2222-4222-8222-222222222222";
const NO_OWNER = "33333333-3333-4333-8333-333333333333";
const SPARK = "44444444-4444-4444-8444-444444444444";
const MISSING = "55555555-5555-4555-8555-555555555555";

let tables: FakeTables;

beforeEach(() => {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  tables = {
    hearths: [
      { id: HEARTH, slug: "theirs", owner_fid: OWNER, owner_wallet: null },
      { id: MY_HEARTH, slug: "mine", owner_fid: ME, owner_wallet: null },
      { id: NO_OWNER, slug: "nobody", owner_fid: null, owner_wallet: null },
    ],
    sparks: [{ id: SPARK, hearth_id: HEARTH, title: "a spark" }],
    content_reports: [],
    user_blocks: [],
  };
  setServiceClientForTests(fakeClient(tables));
});

function req(
  path: string,
  method: string,
  opts: { fid?: number; address?: string; body?: unknown; crossSite?: boolean } = {},
) {
  const h = new Headers({
    "content-type": "application/json",
    origin: opts.crossSite ? "https://evil.example" : "https://trysparkz.com",
    "sec-fetch-site": opts.crossSite ? "cross-site" : "same-origin",
  });
  if (opts.fid) h.set("cookie", `${SESSION_COOKIE}=${mintSession(opts.fid)}`);
  if (opts.address) h.set("cookie", `${SESSION_COOKIE}=${mintAddressSession(opts.address)}`);
  return new NextRequest(`https://trysparkz.com/api/${path}`, {
    method,
    headers: h,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

const reportHearth = { target_type: "hearth", target_id: HEARTH, reason: "spam" };

// --- pure helpers ---

test("viewerIdentity: fid first, then the lower-cased address, else null", () => {
  assert.equal(viewerIdentity({ fid: 5, address: null }), "fid:5");
  assert.equal(viewerIdentity({ fid: null, address: "0xABC" }), "0xabc");
  assert.equal(viewerIdentity({ fid: null, address: null }), null);
  assert.equal(viewerIdentity(null), null);
});

test("hearthOwnerIdentity and isBlockedHearth", () => {
  assert.equal(hearthOwnerIdentity({ owner_fid: 9 }), "fid:9");
  assert.equal(hearthOwnerIdentity({ owner_fid: null, owner_wallet: "0xAB" }), "0xab");
  assert.equal(hearthOwnerIdentity({}), null);
  assert.equal(isBlockedHearth({ owner_fid: 9 }, new Set(["fid:9"])), true);
  assert.equal(isBlockedHearth({ owner_fid: 9 }, new Set(["fid:8"])), false);
  assert.equal(isBlockedHearth({}, new Set(["fid:9"])), false);
});

// --- reports ---

test("report: signed out is 401 and writes nothing", async () => {
  const { POST } = await import("./route");
  const res = await POST(req("reports", "POST", { body: reportHearth }));
  assert.equal(res.status, 401);
  assert.equal(tables.content_reports.length, 0);
});

test("report: cross-site is 403 and writes nothing", async () => {
  const { POST } = await import("./route");
  const res = await POST(req("reports", "POST", { fid: ME, body: reportHearth, crossSite: true }));
  assert.equal(res.status, 403);
  assert.equal(tables.content_reports.length, 0);
});

test("report: a bad reason or a body reporter field is 400", async () => {
  const { POST } = await import("./route");
  assert.equal((await POST(req("reports", "POST", { fid: ME, body: { ...reportHearth, reason: "meh" } }))).status, 400);
  assert.equal(
    (await POST(req("reports", "POST", { fid: ME, body: { ...reportHearth, reporter_id: "fid:1" } }))).status,
    400,
  );
  assert.equal(tables.content_reports.length, 0);
});

test("report: an unknown target is 400", async () => {
  const { POST } = await import("./route");
  const res = await POST(req("reports", "POST", { fid: ME, body: { ...reportHearth, target_id: MISSING } }));
  assert.equal(res.status, 400);
});

test("report: a Hearth report is stored with the session identity", async () => {
  const { POST } = await import("./route");
  const res = await POST(req("reports", "POST", { fid: ME, body: { ...reportHearth, note: "  bot  " } }));
  assert.equal(res.status, 201);
  assert.equal(tables.content_reports.length, 1);
  const r = tables.content_reports[0];
  assert.equal(r.reporter_id, `fid:${ME}`);
  assert.equal(r.hearth_id, HEARTH);
  assert.equal(r.note, "bot");
});

test("report: a Spark report takes the Spark's Hearth", async () => {
  const { POST } = await import("./route");
  const res = await POST(
    req("reports", "POST", { address: WALLET, body: { target_type: "spark", target_id: SPARK, reason: "abuse" } }),
  );
  assert.equal(res.status, 201);
  assert.equal(tables.content_reports[0].hearth_id, HEARTH);
  assert.equal(tables.content_reports[0].reporter_id, WALLET);
});

test("reports list and review: admin only", async () => {
  tables.content_reports.push({ id: SPARK, status: "open", created_at: "2026-11-21T10:00:00Z" });
  const { GET, PATCH } = await import("./route");
  assert.equal((await GET(req("reports", "GET", { fid: ME }))).status, 401);
  const list = await GET(req("reports", "GET", { fid: ADMIN }));
  assert.equal(list.status, 200);
  assert.equal((await list.json()).data.length, 1);

  assert.equal((await PATCH(req("reports", "PATCH", { fid: ME, body: { id: SPARK, status: "reviewed" } }))).status, 401);
  assert.equal(tables.content_reports[0].status, "open");
  const done = await PATCH(req("reports", "PATCH", { fid: ADMIN, body: { id: SPARK, status: "reviewed" } }));
  assert.equal(done.status, 200);
  assert.equal(tables.content_reports[0].status, "reviewed");
});

// --- blocks ---

test("block: signed out is 401, cross-site is 403", async () => {
  const { POST, GET } = await import("../blocks/route");
  assert.equal((await POST(req("blocks", "POST", { body: { hearth_id: HEARTH } }))).status, 401);
  assert.equal((await GET(req("blocks", "GET"))).status, 401);
  assert.equal(
    (await POST(req("blocks", "POST", { fid: ME, body: { hearth_id: HEARTH }, crossSite: true }))).status,
    403,
  );
  assert.equal(tables.user_blocks.length, 0);
});

test("block: blocks the Hearth's owner, never yourself or an ownerless Hearth", async () => {
  const { POST, GET } = await import("../blocks/route");
  const res = await POST(req("blocks", "POST", { fid: ME, body: { hearth_id: HEARTH } }));
  assert.equal(res.status, 201);
  assert.deepEqual(tables.user_blocks.map((b) => [b.blocker_id, b.blocked_id]), [[`fid:${ME}`, `fid:${OWNER}`]]);

  assert.equal((await POST(req("blocks", "POST", { fid: ME, body: { hearth_id: MY_HEARTH } }))).status, 400);
  assert.equal((await POST(req("blocks", "POST", { fid: ME, body: { hearth_id: NO_OWNER } }))).status, 400);
  assert.equal(tables.user_blocks.length, 1);

  const list = await GET(req("blocks", "GET", { fid: ME }));
  assert.deepEqual((await list.json()).data, [`fid:${OWNER}`]);
});

test("unblock: removes only the caller's own block", async () => {
  tables.user_blocks.push(
    { id: "u1", blocker_id: `fid:${ME}`, blocked_id: `fid:${OWNER}` },
    { id: "u2", blocker_id: "fid:9999", blocked_id: `fid:${OWNER}` },
  );
  const { DELETE } = await import("../blocks/route");
  assert.equal((await DELETE(req("blocks", "DELETE", { fid: ME, body: { blocked_id: "nope" } }))).status, 400);
  const res = await DELETE(req("blocks", "DELETE", { fid: ME, body: { blocked_id: `fid:${OWNER}` } }));
  assert.equal(res.status, 200);
  assert.deepEqual(tables.user_blocks.map((b) => b.id), ["u2"]);
});

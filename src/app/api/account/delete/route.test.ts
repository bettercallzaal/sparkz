import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, mintSession, mintAddressSession } from "@/lib/session";
import { setServiceClientForTests } from "@/lib/supabase/server";
import { fakeClient, type FakeTables } from "@/lib/db/fake-client";

// In-app account deletion (App Store guideline 5.1.1(v)), against an in-memory database.
const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const ME = 7000;
const OTHER = 8000;
const WALLET = "0x" + "ab".repeat(20);
const AWAKE = "11111111-1111-4111-8111-111111111111";
const ASLEEP = "22222222-2222-4222-8222-222222222222";
const THEIRS = "33333333-3333-4333-8333-333333333333";

let tables: FakeTables;

beforeEach(() => {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  tables = {
    hearths: [
      { id: AWAKE, slug: "mine-awake", name: "Mine awake", status: "spark", owner_fid: OTHER },
      { id: ASLEEP, slug: "mine-asleep", name: "Mine asleep", status: "dormant", owner_fid: ME },
      { id: THEIRS, slug: "theirs", name: "Theirs", status: "spark", owner_fid: OTHER },
    ],
    hearth_backers: [
      { id: "b1", hearth_id: THEIRS, backer_id: `fid:${ME}`, kind: "boost" },
      { id: "b2", hearth_id: THEIRS, backer_id: `fid:${OTHER}`, kind: "boost" },
      { id: "b3", hearth_id: THEIRS, backer_id: WALLET, kind: "boost" },
      // Paid and on-chain rows: the Hearth's money record, kept and anonymised.
      { id: "p1", hearth_id: THEIRS, backer_kind: "fid", backer_id: `fid:${ME}`, kind: "backing", amount_or_qty: 25, unit: "USD", provider: "ledger", provider_ref: "inv-1", chain: null, metadata: { ip_hash: "h", email: "a@b.c", tier: "gold" } },
      { id: "p2", hearth_id: THEIRS, backer_kind: "wallet", backer_id: WALLET, kind: "collectable", amount_or_qty: 1, unit: "ZAO", provider: "clanker", provider_ref: "0x" + "ef".repeat(32), chain: "base" },
    ],
    team_signups: [{ id: "t1", hearth_id: THEIRS, wallet: WALLET, name: "x" }],
    sparks: [
      { id: "s1", hearth_id: THEIRS, created_by_fid: ME, title: "lit by me" },
      { id: "s2", hearth_id: THEIRS, created_by_fid: OTHER, title: "lit by them" },
    ],
    content_reports: [
      { id: "r1", reporter_id: `fid:${ME}`, target_type: "hearth", target_id: THEIRS, hearth_id: THEIRS },
      { id: "r2", reporter_id: `fid:${OTHER}`, target_type: "hearth", target_id: THEIRS, hearth_id: THEIRS },
      { id: "r3", reporter_id: WALLET, target_type: "hearth", target_id: THEIRS, hearth_id: THEIRS },
    ],
    user_blocks: [
      { id: "k1", blocker_id: `fid:${ME}`, blocked_id: `fid:${OTHER}` },
      { id: "k2", blocker_id: `fid:${OTHER}`, blocked_id: `fid:${ME}` },
      { id: "k3", blocker_id: WALLET, blocked_id: `fid:${OTHER}` },
    ],
  };
  setServiceClientForTests(fakeClient(tables));
});

function req(opts: { fid?: number; address?: string; body?: unknown; crossSite?: boolean } = {}) {
  const h = new Headers({
    "content-type": "application/json",
    origin: opts.crossSite ? "https://evil.example" : "https://trysparkz.com",
    "sec-fetch-site": opts.crossSite ? "cross-site" : "same-origin",
  });
  if (opts.fid) h.set("cookie", `${SESSION_COOKIE}=${mintSession(opts.fid)}`);
  if (opts.address) h.set("cookie", `${SESSION_COOKIE}=${mintAddressSession(opts.address)}`);
  return new NextRequest("https://trysparkz.com/api/account/delete", {
    method: "POST",
    headers: h,
    body: JSON.stringify(opts.body ?? { confirm: "delete" }),
  });
}

test("signed out is 401 and deletes nothing", async () => {
  const { POST } = await import("./route");
  const res = await POST(req());
  assert.equal(res.status, 401);
  assert.equal(tables.hearth_backers.length, 5);
});

test("cross-site is 403 and deletes nothing", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ fid: ME, crossSite: true }));
  assert.equal(res.status, 403);
  assert.equal(tables.hearth_backers.length, 5);
});

test("a body without confirm: 'delete' is 400 and deletes nothing", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ fid: ME, body: { confirm: "yes" } }));
  assert.equal(res.status, 400);
  assert.equal(tables.hearth_backers.length, 5);
});

test("owning an awake Hearth is 409, names it, and deletes nothing", async () => {
  tables.hearths[0].owner_fid = ME;
  const { POST } = await import("./route");
  const res = await POST(req({ fid: ME }));
  assert.equal(res.status, 409);
  const json = await res.json();
  assert.deepEqual(json.hearths, [{ slug: "mine-awake", name: "Mine awake" }]);
  assert.equal(tables.hearth_backers.length, 5);
  assert.equal(tables.hearths[1].owner_fid, ME);
});

test("an FID session: its boosts go, its Sparks stay unlinked, asleep Hearths lose the owner, others untouched", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ fid: ME }));
  assert.equal(res.status, 200);
  assert.deepEqual(tables.hearth_backers.map((b) => b.id), ["b2", "b3", "p1", "p2"]);
  assert.equal(tables.sparks.length, 2);
  assert.equal(tables.sparks.find((s) => s.id === "s1")?.created_by_fid, null);
  assert.equal(tables.sparks.find((s) => s.id === "s2")?.created_by_fid, OTHER);
  assert.equal(tables.hearths.find((h) => h.id === ASLEEP)?.owner_fid, null);
  assert.equal(tables.hearths.find((h) => h.id === THEIRS)?.owner_fid, OTHER);
  assert.match(res.headers.get("set-cookie") ?? "", new RegExp(`${SESSION_COOKIE}=;`));
});

test("a wallet session: its boosts and team sign-ups go, FID rows untouched", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ address: WALLET }));
  assert.equal(res.status, 200);
  assert.deepEqual(tables.hearth_backers.map((b) => b.id), ["b1", "b2", "p1", "p2"]);
  assert.equal(tables.team_signups.length, 0);
});

test("an FID session: its reports and blocks go; blocks others made of it stay", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ fid: ME }));
  assert.equal(res.status, 200);
  assert.deepEqual(tables.content_reports.map((r) => r.id), ["r2", "r3"]);
  assert.deepEqual(tables.user_blocks.map((b) => b.id), ["k2", "k3"]);
});

test("a wallet session: its reports and blocks go", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ address: WALLET }));
  assert.equal(res.status, 200);
  assert.deepEqual(tables.content_reports.map((r) => r.id), ["r1", "r2"]);
  assert.deepEqual(tables.user_blocks.map((b) => b.id), ["k1", "k2"]);
});

test("paid and on-chain backing rows survive, keep amount, provider and txhash, and lose the person", async () => {
  const { POST } = await import("./route");
  const before = structuredClone(tables.hearth_backers.filter((b) => b.kind !== "boost"));
  assert.equal((await POST(req({ fid: ME }))).status, 200);
  assert.equal((await POST(req({ address: WALLET }))).status, 200);
  for (const was of before) {
    const now = tables.hearth_backers.find((b) => b.id === was.id);
    assert.ok(now, `row ${was.id} was deleted`);
    assert.equal(now.backer_id, "deleted");
    assert.equal(now.backer_kind, "user");
    for (const col of ["hearth_id", "kind", "amount_or_qty", "unit", "provider", "provider_ref", "chain"]) {
      assert.equal(now[col], was[col], `${was.id}.${col} changed`);
    }
  }
  assert.equal(tables.hearth_backers.some((b) => b.backer_id === `fid:${ME}` || b.backer_id === WALLET), false);
  assert.deepEqual(tables.hearth_backers.find((b) => b.id === "p1")?.metadata, { tier: "gold" });
  assert.deepEqual(tables.hearth_backers.filter((b) => b.kind === "boost").map((b) => b.id), ["b2"]);
});

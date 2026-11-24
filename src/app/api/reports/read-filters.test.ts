import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, mintSession } from "@/lib/session";
import { setServiceClientForTests } from "@/lib/supabase/server";
import { fakeClient, type FakeTables } from "@/lib/db/fake-client";

// The block read filters (migration 0009) and the admin reports list, against an
// in-memory database: a person who blocked a Hearth's owner does not see that Hearth in
// Explore or the activity strip, nor its Sparks.
const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const ME = 7000;
const OWNER = 8000;
const ADMIN = 19640; // in ADMIN_FIDS (src/lib/admin-identities.ts)
const THEIRS = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const SPARK = "44444444-4444-4444-8444-444444444444";
const REPORT = "66666666-6666-4666-8666-666666666666";

let tables: FakeTables;

beforeEach(() => {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  tables = {
    hearths: [
      { id: THEIRS, slug: "theirs", name: "Theirs", type: "creator", status: "spark", owner_fid: OWNER, owner_wallet: null, metadata: {}, economic_config: {}, created_at: "2026-11-01T00:00:00Z" },
      { id: OTHER, slug: "other", name: "Other", type: "culture", status: "spark", owner_fid: null, owner_wallet: null, metadata: {}, economic_config: {}, created_at: "2026-11-02T00:00:00Z" },
    ],
    hearth_backers: [],
    meme_receipts: [],
    sparks: [{ id: SPARK, hearth_id: THEIRS, title: "a spark", status: "live", created_at: "2026-11-03T00:00:00Z" }],
    content_reports: [],
    user_blocks: [],
  };
  setServiceClientForTests(fakeClient(tables));
});

function req(path: string, fid?: number) {
  const h = new Headers({ origin: "https://trysparkz.com", "sec-fetch-site": "same-origin" });
  if (fid) h.set("cookie", `${SESSION_COOKIE}=${mintSession(fid)}`);
  return new NextRequest(`https://trysparkz.com/api/${path}`, { method: "GET", headers: h });
}

function block() {
  tables.user_blocks.push({ id: "k1", blocker_id: `fid:${ME}`, blocked_id: `fid:${OWNER}` });
}

test("directory: a blocked owner's Hearth is left out for the blocker only", async () => {
  block();
  const { GET } = await import("../directory/route");
  const mine = await (await GET(req("directory", ME))).json();
  assert.deepEqual(mine.data.map((h: { slug: string }) => h.slug), ["other"]);
  const anon = await (await GET(req("directory"))).json();
  assert.equal(anon.data.length, 2);
});

test("sparks: empty for a viewer who blocked the Hearth's owner", async () => {
  block();
  const { GET } = await import("../sparks/route");
  const mine = await (await GET(req("sparks?slug=theirs", ME))).json();
  assert.deepEqual(mine.data, []);
  const anon = await (await GET(req("sparks?slug=theirs"))).json();
  assert.equal(anon.data.length, 1);
});

test("activity: a blocked owner's Hearth is left out", async () => {
  block();
  const { GET } = await import("../activity/route");
  const mine = await (await GET(req("activity", ME))).json();
  const names = (mine.data.events as { hearth: string }[]).map((e) => e.hearth);
  assert.equal(names.includes("Theirs"), false);
  assert.equal(names.includes("Other"), true);
});

test("reports list: each row names its Hearth and its Spark", async () => {
  tables.content_reports.push({
    id: REPORT,
    reporter_id: `fid:${ME}`,
    target_type: "spark",
    target_id: SPARK,
    hearth_id: THEIRS,
    reason: "abuse",
    status: "open",
    created_at: "2026-11-21T10:00:00Z",
  });
  const { GET } = await import("./route");
  const res = await GET(req("reports", ADMIN));
  assert.equal(res.status, 200);
  const [row] = (await res.json()).data;
  assert.equal(row.hearth_slug, "theirs");
  assert.equal(row.hearth_name, "Theirs");
  assert.equal(row.spark_title, "a spark");
});

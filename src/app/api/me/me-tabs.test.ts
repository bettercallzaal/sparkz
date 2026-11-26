import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, mintSession } from "@/lib/session";
import { setServiceClientForTests } from "@/lib/supabase/server";
import { fakeClient, type FakeTables } from "@/lib/db/fake-client";

// /api/me/hearths and /api/me/sparkz back the My Hearths and My Sparkz tabs. Signed out
// is a plain 401 (the page shows a sign-in prompt); signed in lists only the session
// person's own rows.
const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const ME = 501;
const OTHER = 777;

let tables: FakeTables;

beforeEach(() => {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  tables = {
    hearths: [
      { id: "h-mine", slug: "mine", name: "Mine", type: "creator", status: "spark", owner_fid: ME, metadata: {}, created_at: "2026-11-01" },
      { id: "h-theirs", slug: "theirs", name: "Theirs", type: "oss", status: "spark", owner_fid: OTHER, metadata: {}, created_at: "2026-11-02" },
    ],
    hearth_backers: [
      { hearth_id: "h-theirs", backer_id: `fid:${ME}`, kind: "boost", created_at: "2026-11-10" },
      { hearth_id: "h-mine", backer_id: `fid:${OTHER}`, kind: "boost", created_at: "2026-11-11" },
    ],
    sparks: [
      { id: "s-mine", hearth_id: "h-mine", kind: "event", title: "My event", created_by_fid: ME, created_at: "2026-11-12" },
      { id: "s-theirs", hearth_id: "h-theirs", kind: "moment", title: "Their moment", created_by_fid: OTHER, created_at: "2026-11-13" },
    ],
    hearth_bounties: [
      { id: "b-mine", hearth_id: "h-mine", bounty_id: 7, created_at: "2026-11-14" },
      { id: "b-theirs", hearth_id: "h-theirs", bounty_id: 8, created_at: "2026-11-15" },
    ],
    team_signups: [],
  };
  setServiceClientForTests(fakeClient(tables));
});

function req(path: string, fid?: number) {
  const h = new Headers();
  if (fid) h.set("cookie", `${SESSION_COOKIE}=${mintSession(fid)}`);
  return new NextRequest(`https://trysparkz.com${path}`, { headers: h });
}

test("signed out: My Hearths is a 401 with a plain sign-in message", async () => {
  const { GET } = await import("./hearths/route");
  const res = await GET(req("/api/me/hearths"));
  assert.equal(res.status, 401);
  assert.equal((await res.json()).error, "Sign in to see your Hearths");
});

test("signed out: My Sparkz is a 401 with a plain sign-in message", async () => {
  const { GET } = await import("./sparkz/route");
  const res = await GET(req("/api/me/sparkz"));
  assert.equal(res.status, 401);
  assert.equal((await res.json()).error, "Sign in to see your Sparkz");
});

test("My Hearths lists the Hearth I own and the one I boosted", async () => {
  const { GET } = await import("./hearths/route");
  const res = await GET(req("/api/me/hearths", ME));
  assert.equal(res.status, 200);
  const rows = (await res.json()).data as { slug: string; roles: string[] }[];
  assert.deepEqual(rows.map((r) => [r.slug, r.roles]), [
    ["mine", ["owner"]],
    ["theirs", ["backer"]],
  ]);
});

test("My Sparkz lists my Spark, my bounty and my boost, each with its Hearth", async () => {
  const { GET } = await import("./sparkz/route");
  const res = await GET(req("/api/me/sparkz", ME));
  assert.equal(res.status, 200);
  const rows = (await res.json()).data as { key: string; hearth: { slug: string } }[];
  assert.deepEqual(rows.map((r) => [r.key, r.hearth.slug]), [
    ["bounty:b-mine", "mine"],
    ["spark:s-mine", "mine"],
    ["boost:h-theirs", "theirs"],
  ]);
});

test("red control: another person's Sparks, bounties and boosts never show in mine", async () => {
  const { GET } = await import("./sparkz/route");
  const rows = (await (await GET(req("/api/me/sparkz", ME))).json()).data as { key: string }[];
  const keys = rows.map((r) => r.key);
  assert.ok(!keys.includes("spark:s-theirs"));
  assert.ok(!keys.includes("bounty:b-theirs"));
  assert.ok(!keys.includes("boost:h-mine"), "OTHER's boost of my Hearth is not my Spark");
  // And the other person sees their own, not mine.
  const theirs = (await (await GET(req("/api/me/sparkz", OTHER))).json()).data as { key: string }[];
  assert.deepEqual(theirs.map((r) => r.key).sort(), ["boost:h-mine", "bounty:b-theirs", "spark:s-theirs"]);
});

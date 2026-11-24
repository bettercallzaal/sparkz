import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, mintSession } from "@/lib/session";
import { setServiceClientForTests } from "@/lib/supabase/server";
import { fakeClient, type FakeTables } from "@/lib/db/fake-client";

// Boosting needs sign-in (Zaal, ORD-465): a signed-out boost is refused and no typed
// name or email is ever stored as a backer.
const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const ADMIN = 19640; // in ADMIN_FIDS: exempt from the per-IP limit, which the fake client cannot count
const HEARTH = "11111111-1111-4111-8111-111111111111";

let tables: FakeTables;

beforeEach(() => {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  tables = { hearths: [{ id: HEARTH, slug: "h", name: "H" }], hearth_backers: [] };
  setServiceClientForTests(fakeClient(tables));
});

function req(body: unknown, fid?: number) {
  const h = new Headers({ "content-type": "application/json", origin: "https://trysparkz.com", "sec-fetch-site": "same-origin" });
  if (fid) h.set("cookie", `${SESSION_COOKIE}=${mintSession(fid)}`);
  return new NextRequest("https://trysparkz.com/api/boost", { method: "POST", headers: h, body: JSON.stringify(body) });
}

test("signed out with a typed email is 401 and stores nothing", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ hearth_id: HEARTH, backer: "someone@example.com" }));
  assert.equal(res.status, 401);
  assert.equal((await res.json()).error, "Sign in to boost");
  assert.equal(tables.hearth_backers.length, 0);
});

test("signed out with a typed name is 401 and stores nothing", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ hearth_id: HEARTH, backer: "a fan" }));
  assert.equal(res.status, 401);
  assert.equal(tables.hearth_backers.length, 0);
});

test("signed in: the session FID is the backer, and a typed backer in the body is ignored", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ hearth_id: HEARTH, backer: "someone@example.com" }, ADMIN));
  assert.equal(res.status, 201);
  assert.deepEqual(tables.hearth_backers.map((b) => b.backer_id), [`fid:${ADMIN}`]);
});

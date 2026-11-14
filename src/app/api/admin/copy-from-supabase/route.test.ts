import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { SESSION_COOKIE, mintSession } from "@/lib/session";

// Throwaway test key; never a real secret.
const KEY = "test-only-session-secret-0123456789abcdef";
const ADMIN_FID = 19640;

async function withEnv(fn: () => Promise<void>) {
  const saved = { ...process.env };
  process.env.SPARKZ_SESSION_SECRET = KEY;
  // No database keys: if a request got past the gates, the copy would stop before any read.
  for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL_UNPOOLED", "DATABASE_URL", "STORAGE_DATABASE_URL", "SPARKZ_ADMIN_TOKEN"]) {
    delete process.env[k];
  }
  try {
    await fn();
  } finally {
    process.env = saved;
  }
}

function post(headers: Record<string, string>, withAdminCookie: boolean) {
  const h = new Headers({ "content-type": "application/json", ...headers });
  if (withAdminCookie) h.set("cookie", `${SESSION_COOKIE}=${mintSession(ADMIN_FID)}`);
  return new NextRequest("https://trysparkz.com/api/admin/copy-from-supabase", {
    method: "POST",
    headers: h,
    body: JSON.stringify({ apply: true, withImages: true }),
  });
}

test("a cross-site POST is refused with 403, even with an admin session cookie", async () => {
  await withEnv(async () => {
    const res = await POST(post({ "sec-fetch-site": "cross-site" }, true));
    assert.equal(res.status, 403);
    assert.deepEqual(await res.json(), { ok: false, error: "Cross-site request refused" });
  });
});

test("a POST from another origin is refused with 403", async () => {
  await withEnv(async () => {
    const res = await POST(post({ origin: "https://evil.example" }, true));
    assert.equal(res.status, 403);
  });
});

test("a same-site POST with no session is refused with 401", async () => {
  await withEnv(async () => {
    const res = await POST(post({ origin: "https://trysparkz.com" }, false));
    assert.equal(res.status, 401);
  });
});

test("a same-site admin passes the gates; with no keys the copy stops before any read", async () => {
  await withEnv(async () => {
    const res = await POST(post({ origin: "https://trysparkz.com" }, true));
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.data.mode, "apply");
    assert.match(json.data.stopped, /Supabase keys are not set/);
    assert.deepEqual(json.data.tables, []);
  });
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { ADMIN_TOKEN_HEADER, isAdmin, isAdminSession, requireAdmin, requireHearthOwner } from "./auth";
import { SESSION_COOKIE, mintAddressSession, mintSession } from "./session";

// Throwaway test values; never real credentials.
const KEY = "test-only-session-secret-0123456789abcdef";
const AGENT = "test-only-agent-token-abcdef0123456789";
const ADMIN_FID = 19640;
const ADMIN_ADDRESS = "0x7234c36a71ec237c2ae7698e8916e0735001e9af";
const TESTER_FID = 1057869; // alpha tester, not an admin

const saved = {
  secret: process.env.SPARKZ_SESSION_SECRET,
  token: process.env.SPARKZ_ADMIN_TOKEN,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Awaits fn before restoring, so an async test body runs entirely under these values.
async function env(vars: Record<string, string | undefined>, fn: () => unknown): Promise<void> {
  const before: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    before[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    await fn();
  } finally {
    for (const [k, v] of Object.entries(before)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

function req(headers: Record<string, string> = {}, cookie?: string | null): NextRequest {
  const h = new Headers(headers);
  if (cookie) h.set("cookie", `${SESSION_COOKIE}=${cookie}`);
  return new NextRequest("https://trysparkz.com/api/admin/claim-hearth", { method: "POST", headers: h });
}

// No database in these tests: the Supabase env is unset, so any route that reached
// getServiceClient() would throw. A test that passes therefore proves the gate
// answered before any database call.
const NO_DB = { NEXT_PUBLIC_SUPABASE_URL: undefined, SUPABASE_SERVICE_ROLE_KEY: undefined };

test("no session and no token: not admin, requireAdmin answers 401", async () => {
  await env({ SPARKZ_SESSION_SECRET: KEY, SPARKZ_ADMIN_TOKEN: AGENT }, async () => {
    assert.equal(isAdmin(req()), false);
    const res = requireAdmin(req());
    assert.equal(res?.status, 401);
    assert.deepEqual(await res?.json(), { ok: false, error: "Unauthorized" });
  });
});

test("the agent token passes only when configured and exactly equal", async () => {
  await env({ SPARKZ_ADMIN_TOKEN: AGENT }, () => {
    assert.equal(isAdmin(req({ [ADMIN_TOKEN_HEADER]: AGENT })), true);
    assert.equal(requireAdmin(req({ [ADMIN_TOKEN_HEADER]: AGENT })), null);
    for (const wrong of ["", AGENT.slice(0, -1), `${AGENT}x`, AGENT.toUpperCase()]) {
      assert.equal(isAdmin(req({ [ADMIN_TOKEN_HEADER]: wrong })), false, `accepted ${JSON.stringify(wrong)}`);
    }
  });
  // Unset or empty token: a missing or empty header must not match an empty expected value.
  for (const token of [undefined, ""]) {
    await env({ SPARKZ_ADMIN_TOKEN: token }, () => {
      assert.equal(isAdmin(req()), false, `token ${JSON.stringify(token)}, no header`);
      assert.equal(isAdmin(req({ [ADMIN_TOKEN_HEADER]: "" })), false, `token ${JSON.stringify(token)}, empty header`);
      assert.equal(isAdmin(req({ [ADMIN_TOKEN_HEADER]: AGENT })), false);
    });
  }
});

test("an admin session (FID or address) is admin; a tester session is not", async () => {
  await env({ SPARKZ_SESSION_SECRET: KEY, SPARKZ_ADMIN_TOKEN: undefined }, () => {
    assert.equal(isAdminSession(req({}, mintSession(ADMIN_FID))), true);
    assert.equal(isAdminSession(req({}, mintAddressSession(ADMIN_ADDRESS.toUpperCase().replace("0X", "0x")))), true);
    assert.equal(isAdminSession(req({}, mintSession(TESTER_FID))), false);
    assert.equal(requireAdmin(req({}, mintSession(TESTER_FID)))?.status, 401);
  });
});

test("an admin session sent cross-site is not admin", async () => {
  await env({ SPARKZ_SESSION_SECRET: KEY }, () => {
    const cookie = mintSession(ADMIN_FID);
    assert.equal(isAdminSession(req({ "sec-fetch-site": "cross-site" }, cookie)), false);
    assert.equal(isAdminSession(req({ origin: "https://evil.example" }, cookie)), false);
  });
});

test("requireHearthOwner lets an admin through without reading the database", async () => {
  await env({ ...NO_DB, SPARKZ_SESSION_SECRET: KEY, SPARKZ_ADMIN_TOKEN: AGENT }, async () => {
    assert.equal(await requireHearthOwner(req({}, mintSession(ADMIN_FID)), "any-id"), null);
    assert.equal(await requireHearthOwner(req({ [ADMIN_TOKEN_HEADER]: AGENT }), "any-id"), null);
  });
});

test("requireHearthOwner refuses a missing or cross-site session with 401 before the database", async () => {
  await env({ ...NO_DB, SPARKZ_SESSION_SECRET: KEY, SPARKZ_ADMIN_TOKEN: AGENT }, async () => {
    const none = await requireHearthOwner(req(), "any-id");
    assert.equal(none?.status, 401);
    const cross = await requireHearthOwner(req({ origin: "https://evil.example" }, mintSession(TESTER_FID)), "any-id");
    assert.equal(cross?.status, 401);
  });
});

test("restores the environment it changed", async () => {
  assert.equal(process.env.SPARKZ_SESSION_SECRET, saved.secret);
  assert.equal(process.env.SPARKZ_ADMIN_TOKEN, saved.token);
  assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL, saved.url);
  assert.equal(process.env.SUPABASE_SERVICE_ROLE_KEY, saved.key);
});

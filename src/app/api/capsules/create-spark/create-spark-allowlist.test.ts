import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, mintSession } from "@/lib/session";
import { HEARTH_CREATE_CLOSED_MESSAGE } from "@/lib/alpha-access";

// Zaal, 2026-11-19: opening a Hearth is allowlist-only for now. The refusal comes before
// any database call, so these run without one.
const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret

function post(cookieFid?: number) {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  const h = new Headers({ "content-type": "application/json", origin: "https://trysparkz.com", "sec-fetch-site": "same-origin" });
  if (cookieFid) h.set("cookie", `${SESSION_COOKIE}=${mintSession(cookieFid)}`);
  return new NextRequest("https://trysparkz.com/api/capsules/create-spark", {
    method: "POST",
    headers: h,
    body: JSON.stringify({ name: "Test Hearth", type: "creator", email: "someone@example.com" }),
  });
}

test("signed out (the email path) cannot open a Hearth", async () => {
  const { POST } = await import("./route");
  const res = await POST(post());
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { ok: false, error: HEARTH_CREATE_CLOSED_MESSAGE });
});

test("a signed-in FID that is not on the allowlist cannot open a Hearth", async () => {
  const { POST } = await import("./route");
  const res = await POST(post(2));
  assert.equal(res.status, 403);
});

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionClaims } from "@/lib/session";
import { REVIEW_ADDRESS, reviewCodeMatches, reviewSignInEnabled } from "@/lib/review-sign-in";
import { isAdminAddress } from "@/lib/admin-identities";

// Reviewer sign-in (redesign D3). Off unless SPARKZ_REVIEW_CODE is set.
const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const CODE = "test-only-review-code-0123456789"; // throwaway

let ip = 0;
function req(body: unknown, crossSite = false) {
  ip += 1; // a fresh client each time, so the shared sign-in limit never trips here
  const h = new Headers({
    "content-type": "application/json",
    origin: crossSite ? "https://evil.example" : "https://trysparkz.com",
    "sec-fetch-site": crossSite ? "cross-site" : "same-origin",
    "x-forwarded-for": `10.0.0.${ip}`,
  });
  return new NextRequest("https://trysparkz.com/api/auth/review", { method: "POST", headers: h, body: JSON.stringify(body) });
}

function sessionFrom(res: Response): string | undefined {
  const m = /sparkz_session=([^;]*)/.exec(res.headers.get("set-cookie") ?? "");
  return m?.[1];
}

beforeEach(() => {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  process.env.SPARKZ_REVIEW_CODE = CODE;
});
afterEach(() => {
  delete process.env.SPARKZ_REVIEW_CODE;
});

test("off when the code is unset or shorter than 16 characters", async () => {
  const { POST, GET } = await import("./route");
  delete process.env.SPARKZ_REVIEW_CODE;
  assert.equal(reviewSignInEnabled(), false);
  assert.equal((await POST(req({ code: CODE }))).status, 404);
  assert.equal((await (await GET()).json()).data.enabled, false);
  process.env.SPARKZ_REVIEW_CODE = "short";
  assert.equal(reviewSignInEnabled(), false);
  assert.equal(reviewCodeMatches("short"), false);
  assert.equal((await POST(req({ code: "short" }))).status, 404);
});

test("on: GET says enabled", async () => {
  const { GET } = await import("./route");
  assert.equal((await (await GET()).json()).data.enabled, true);
});

test("cross-site is 403 and sets no session", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ code: CODE }, true));
  assert.equal(res.status, 403);
  assert.equal(sessionFrom(res), undefined);
});

test("a wrong code is 401 and sets no session; a bad body is 400", async () => {
  const { POST } = await import("./route");
  const wrong = await POST(req({ code: CODE + "x" }));
  assert.equal(wrong.status, 401);
  assert.equal(sessionFrom(wrong), undefined);
  assert.equal((await POST(req({ code: "" }))).status, 400);
  assert.equal((await POST(req({ code: CODE, fid: 1 }))).status, 400);
});

test("the right code signs in as the fixed review identity, never an admin", async () => {
  const { POST } = await import("./route");
  const res = await POST(req({ code: `  ${CODE}  ` }));
  assert.equal(res.status, 200);
  const value = sessionFrom(res);
  assert.ok(value);
  const claims = readSessionClaims(value);
  assert.deepEqual(claims, { fid: null, address: REVIEW_ADDRESS });
  assert.equal(isAdminAddress(REVIEW_ADDRESS), false);
  assert.equal(SESSION_COOKIE, "sparkz_session");
});

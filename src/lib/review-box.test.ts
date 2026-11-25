import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { reviewSignIn, reviewSignInOn } from "@/lib/auth-session-client";

// Stub the global fetch with one canned JSON response per test.
const realFetch = globalThis.fetch;
function stubFetch(status: number, body: unknown) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;
}
afterEach(() => {
  globalThis.fetch = realFetch;
});

// The Me page shows the App Review code box only when this is true.
test("review box gate: on when the server reports enabled", async () => {
  stubFetch(200, { ok: true, data: { enabled: true } });
  assert.equal(await reviewSignInOn(), true);
});

test("review box gate: hidden when the server reports disabled", async () => {
  stubFetch(200, { ok: true, data: { enabled: false } });
  assert.equal(await reviewSignInOn(), false);
});

test("review box gate: hidden when the check fails", async () => {
  globalThis.fetch = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  assert.equal(await reviewSignInOn(), false);
});

test("review sign-in: wrong code returns the server's message", async () => {
  stubFetch(401, { ok: false, error: "That code is not right" });
  assert.equal(await reviewSignIn("not-the-code"), "That code is not right");
});

test("review sign-in: right code returns null (success)", async () => {
  stubFetch(200, { ok: true, data: { address: "0x0000000000000000000000000000000000000001", review: true } });
  assert.equal(await reviewSignIn("the-review-code-value"), null);
});

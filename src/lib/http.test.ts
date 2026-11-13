import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { forbidCrossSite, isCrossSite } from "./http";

function req(headers: Record<string, string>): NextRequest {
  return new NextRequest("https://trysparkz.com/api/capsules/update", { method: "POST", headers });
}

test("no Origin header and no fetch-site hint is not cross-site (server-to-server, curl)", () => {
  assert.equal(isCrossSite(req({})), false);
});

test("our own origins are same-site", () => {
  for (const origin of ["https://trysparkz.com", "https://sparkz.lol", "https://www.sparkz.lol"]) {
    assert.equal(isCrossSite(req({ origin })), false, origin);
  }
});

test("any other origin, or the browser's cross-site hint, is cross-site", () => {
  assert.equal(isCrossSite(req({ origin: "https://evil.example" })), true);
  assert.equal(isCrossSite(req({ origin: "https://trysparkz.com.evil.example" })), true);
  assert.equal(isCrossSite(req({ origin: "http://trysparkz.com" })), true);
  assert.equal(isCrossSite(req({ "sec-fetch-site": "cross-site" })), true);
  // The hint wins even when the Origin looks like ours.
  assert.equal(isCrossSite(req({ "sec-fetch-site": "cross-site", origin: "https://trysparkz.com" })), true);
});

test("localhost counts as same-site only outside production", () => {
  const env = process.env as Record<string, string | undefined>;
  const before = env.NODE_ENV;
  try {
    env.NODE_ENV = "development";
    assert.equal(isCrossSite(req({ origin: "http://localhost:3000" })), false);
    env.NODE_ENV = "production";
    assert.equal(isCrossSite(req({ origin: "http://localhost:3000" })), true);
  } finally {
    env.NODE_ENV = before;
  }
});

test("forbidCrossSite answers 403 for cross-site and null otherwise", async () => {
  assert.equal(forbidCrossSite(req({ origin: "https://trysparkz.com" })), null);
  const res = forbidCrossSite(req({ origin: "https://evil.example" }));
  assert.ok(res);
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { ok: false, error: "Cross-site request refused" });
});

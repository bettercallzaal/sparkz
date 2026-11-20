import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { lightSparkSchema, editSparkSchema } from "@/lib/validation/schemas";

// Sparks (migration 0008). These run without a database: schema rules, and the refusals
// that come before any database call.
const HEARTH = "11111111-1111-4111-8111-111111111111";
const base = { hearth_id: HEARTH, kind: "moment", title: "Zoostr is lit" };

test("a Spark needs a known kind and a title", () => {
  assert.equal(lightSparkSchema.safeParse(base).success, true);
  assert.equal(lightSparkSchema.safeParse({ ...base, kind: "coin" }).success, false);
  assert.equal(lightSparkSchema.safeParse({ ...base, title: "" }).success, false);
  assert.equal(lightSparkSchema.safeParse({ ...base, title: "x".repeat(121) }).success, false);
});

test("a goal is a metric and a target together, or neither", () => {
  assert.equal(lightSparkSchema.safeParse({ ...base, goal_metric: "backers", goal_target: 10 }).success, true);
  assert.equal(lightSparkSchema.safeParse({ ...base, goal_metric: "backers" }).success, false);
  assert.equal(lightSparkSchema.safeParse({ ...base, goal_target: 10 }).success, false);
  assert.equal(lightSparkSchema.safeParse({ ...base, goal_metric: "backers", goal_target: 0 }).success, false);
  assert.equal(lightSparkSchema.safeParse({ ...base, goal_metric: "likes", goal_target: 5 }).success, false);
  assert.equal(lightSparkSchema.safeParse({ ...base, goal_metric: "receipts", goal_target: 5 }).success, false);
});

test("the end date comes after the start", () => {
  const ok = { ...base, starts_at: "2026-11-20T15:00:00Z", ends_at: "2026-11-27T15:00:00Z" };
  assert.equal(lightSparkSchema.safeParse(ok).success, true);
  assert.equal(lightSparkSchema.safeParse({ ...ok, ends_at: "2026-11-19T15:00:00Z" }).success, false);
});

test("links are https only, and chain_ref takes only known fields", () => {
  assert.equal(lightSparkSchema.safeParse({ ...base, link: "https://example.com/mint" }).success, true);
  assert.equal(lightSparkSchema.safeParse({ ...base, link: "http://example.com/mint" }).success, false);
  assert.equal(lightSparkSchema.safeParse({ ...base, link: "javascript:alert(1)" }).success, false);
  assert.equal(
    lightSparkSchema.safeParse({ ...base, chain_ref: { chain_id: 8453, contract: "0x" + "a".repeat(40) } }).success,
    true,
  );
  assert.equal(lightSparkSchema.safeParse({ ...base, chain_ref: { owner: "me" } }).success, false);
});

test("unknown fields are refused, so a caller cannot set created_by_fid", () => {
  assert.equal(lightSparkSchema.safeParse({ ...base, created_by_fid: 1 }).success, false);
  assert.equal(editSparkSchema.safeParse({ id: HEARTH, created_by_fid: 1 }).success, false);
});

function req(method: string, body?: unknown, crossSite = false) {
  const h = new Headers({ "content-type": "application/json" });
  h.set("origin", crossSite ? "https://evil.example" : "https://trysparkz.com");
  h.set("sec-fetch-site", crossSite ? "cross-site" : "same-origin");
  return new NextRequest("https://trysparkz.com/api/sparks", {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test("cross-site writes are refused before anything else", async () => {
  const { POST, PATCH } = await import("./route");
  assert.equal((await POST(req("POST", base, true))).status, 403);
  assert.equal((await PATCH(req("PATCH", { id: HEARTH, status: "live" }, true))).status, 403);
});

test("a bad body is a 400 before any database call", async () => {
  const { POST } = await import("./route");
  assert.equal((await POST(req("POST", { ...base, kind: "coin" }))).status, 400);
});

test("GET needs a valid slug", async () => {
  const { GET } = await import("./route");
  const res = await GET(new NextRequest("https://trysparkz.com/api/sparks?slug=Bad Slug"));
  assert.equal(res.status, 400);
});

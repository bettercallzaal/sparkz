import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { joinTeamSchema } from "@/lib/validation/schemas";

// Zaal, 2026-11-19: Hearth creation stays allowlist-only, but people can apply to the
// Sparkz team. Applications are team_signups rows with source "apply".
const base = { slug: "sparkz", name: "Ada", wallet: "0x" + "a".repeat(40) };

test("the team schema takes source apply and zao, and nothing else", () => {
  assert.equal(joinTeamSchema.safeParse({ ...base, source: "apply" }).success, true);
  assert.equal(joinTeamSchema.safeParse({ ...base, source: "zao" }).success, true);
  assert.equal(joinTeamSchema.safeParse(base).success, true);
  assert.equal(joinTeamSchema.safeParse({ ...base, source: "admin" }).success, false);
});

test("reading the team list needs an admin; signed out gets 401 before any database call", async () => {
  const { GET } = await import("./route");
  const res = await GET(new NextRequest("https://trysparkz.com/api/team?source=apply"));
  assert.equal(res.status, 401);
});

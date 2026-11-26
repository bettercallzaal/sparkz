import { test } from "node:test";
import assert from "node:assert/strict";
import { deployEmpireSchema } from "./validation/schemas";

const base = {
  hearth_id: "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e",
  name: "Test Empire",
  owner: "0x" + "a".repeat(40),
  signature: "0x" + "b".repeat(130),
  code: "c".repeat(32) + ".1764100000." + "d".repeat(43),
  code_signature: "0x" + "e".repeat(130),
};

test("empire deploy needs the one-time code and its signature", () => {
  const noCode: Record<string, unknown> = { ...base };
  delete noCode.code;
  const noCodeSig: Record<string, unknown> = { ...base };
  delete noCodeSig.code_signature;
  assert.equal(deployEmpireSchema.safeParse(noCode).success, false);
  assert.equal(deployEmpireSchema.safeParse(noCodeSig).success, false);
  assert.equal(deployEmpireSchema.safeParse({ ...base, code: "not-a-code" }).success, false);
  assert.equal(deployEmpireSchema.safeParse(base).success, true);
});

test("empire deploy links must be https", () => {
  assert.equal(deployEmpireSchema.safeParse({ ...base, website_url: "https://thezao.com", logo_uri: "https://thezao.com/logo.png" }).success, true);
  for (const field of ["logo_uri", "website_url", "twitter_url", "telegram_url"]) {
    for (const bad of ["javascript:alert(1)", "data:image/png;base64,AAAA", "http://thezao.com"]) {
      assert.equal(deployEmpireSchema.safeParse({ ...base, [field]: bad }).success, false, `${field}=${bad}`);
    }
  }
});

test("empire deploy signature has a length cap", () => {
  assert.equal(deployEmpireSchema.safeParse(base).success, true);
  assert.equal(deployEmpireSchema.safeParse({ ...base, signature: "0x" + "b".repeat(2000) }).success, false);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { privateKeyToAccount } from "viem/accounts";
import {
  checkDeployCode,
  deployCodeMessage,
  deploySubject,
  DEPLOY_CODE_TTL_MS,
  issueDeployCode,
} from "./deploy-code";

process.env.SPARKZ_SESSION_SECRET = "test-secret-that-is-at-least-32-characters-long";

const owner = privateKeyToAccount("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
const other = privateKeyToAccount("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
const HEARTH = "11111111-1111-4111-8111-111111111111";
const OTHER_HEARTH = "22222222-2222-4222-8222-222222222222";
const SLUG = "zlank";
const NAME = "ZLANK";
const FID = deploySubject({ fid: 1234, address: null })!;

async function signed(subject = FID, hearthId = HEARTH, now = Date.now(), signer = owner) {
  const issued = issueDeployCode(subject, hearthId, now)!;
  const codeSignature = await signer.signMessage({
    message: deployCodeMessage({ hearthSlug: SLUG, name: NAME, code: issued.code, issuedAt: issued.issuedAt }),
  });
  return { code: issued.code, codeSignature };
}

function check(s: { code: string; codeSignature: `0x${string}` }, over: Partial<Parameters<typeof checkDeployCode>[0]> = {}) {
  return checkDeployCode({
    code: s.code,
    codeSignature: s.codeSignature,
    subject: FID,
    hearthId: HEARTH,
    hearthSlug: SLUG,
    name: NAME,
    owner: owner.address,
    ...over,
  });
}

test("happy path: a fresh code signed by the owner wallet passes", async () => {
  const r = await check(await signed());
  assert.equal(r.ok, true);
});

test("replay: the same code and signature are refused the second time", async () => {
  const s = await signed();
  assert.equal((await check(s)).ok, true);
  const again = await check(s);
  assert.equal(again.ok, false);
  assert.match(!again.ok ? again.error : "", /already used/);
});

test("expired: a code older than 5 minutes is refused", async () => {
  const issuedAt = Date.now() - DEPLOY_CODE_TTL_MS - 2000;
  const r = await check(await signed(FID, HEARTH, issuedAt));
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /expired/);
});

test("a code issued for another fid is refused", async () => {
  const s = await signed(deploySubject({ fid: 999, address: null })!);
  const r = await check(s);
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /not valid for this sign-in and Hearth/);
});

test("a code issued for another Hearth is refused", async () => {
  const r = await check(await signed(FID, OTHER_HEARTH));
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /not valid for this sign-in and Hearth/);
});

test("a code signed by a wallet other than the owner is refused", async () => {
  const r = await check(await signed(FID, HEARTH, Date.now(), other));
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /did not sign/);
});

test("a signature over another Hearth slug or name is refused", async () => {
  assert.equal((await check(await signed(), { hearthSlug: "other" })).ok, false);
  assert.equal((await check(await signed(), { name: "OTHER" })).ok, false);
});

test("a refused bad signature does not burn the code", async () => {
  const s = await signed();
  const bad = await check({ code: s.code, codeSignature: (await other.signMessage({ message: "x" })) });
  assert.equal(bad.ok, false);
  assert.equal((await check(s)).ok, true);
});

test("a code with a forged time is refused", async () => {
  const s = await signed();
  const [n, iat, mac] = s.code.split(".");
  const r = await check({ code: `${n}.${Number(iat) + 60}.${mac}`, codeSignature: s.codeSignature });
  assert.equal(r.ok, false);
});

test("no secret configured: no code is issued and none is accepted", async () => {
  const s = await signed();
  const saved = process.env.SPARKZ_SESSION_SECRET;
  delete process.env.SPARKZ_SESSION_SECRET;
  try {
    assert.equal(issueDeployCode(FID, HEARTH), null);
    assert.equal((await check(s)).ok, false);
  } finally {
    process.env.SPARKZ_SESSION_SECRET = saved;
  }
});

test("operator wallet session binds by address", () => {
  assert.equal(deploySubject({ fid: null, address: "0xABC" }), "addr:0xabc");
  assert.equal(deploySubject({ fid: null, address: null }), null);
});

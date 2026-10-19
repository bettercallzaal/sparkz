import { test } from "node:test";
import assert from "node:assert/strict";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { createSiweMessage } from "viem/siwe";
import { verifySiweLogin } from "./siwe";

const DOMAIN = "trysparkz.com";
const NONCE = "a1b2c3d4e5f6a7b8";
const NOW = new Date("2026-10-18T12:00:00.000Z");
const account = privateKeyToAccount(generatePrivateKey());

function message(over: Partial<Parameters<typeof createSiweMessage>[0]> = {}) {
  return createSiweMessage({
    address: account.address,
    chainId: 8453,
    domain: DOMAIN,
    nonce: NONCE,
    uri: `https://${DOMAIN}/admin`,
    version: "1",
    issuedAt: NOW,
    expirationTime: new Date(NOW.getTime() + 5 * 60_000),
    ...over,
  });
}

async function signed(msg: string) {
  return { message: msg, signature: await account.signMessage({ message: msg }) };
}

test("a valid message from the signer returns its lowercased address", async () => {
  const m = await signed(message());
  const addr = await verifySiweLogin({ ...m, nonce: NONCE, domain: DOMAIN, now: NOW });
  assert.equal(addr, account.address.toLowerCase());
});

test("a forged signature (another key) is refused", async () => {
  const other = privateKeyToAccount(generatePrivateKey());
  const msg = message();
  const signature = await other.signMessage({ message: msg });
  await assert.rejects(verifySiweLogin({ message: msg, signature, nonce: NONCE, domain: DOMAIN, now: NOW }), /signature/);
});

test("a message edited after signing is refused", async () => {
  const m = await signed(message());
  const edited = m.message.replace("Chain ID: 8453", "Chain ID: 1");
  await assert.rejects(verifySiweLogin({ ...m, message: edited, nonce: NONCE, domain: DOMAIN, now: NOW }), /signature/);
});

test("an expired message is refused", async () => {
  const m = await signed(message());
  const later = new Date(NOW.getTime() + 6 * 60_000);
  await assert.rejects(verifySiweLogin({ ...m, nonce: NONCE, domain: DOMAIN, now: later }), /not valid now/);
});

test("a message with no expiry, or one over 10 minutes, is refused", async () => {
  const noExp = await signed(message({ expirationTime: undefined }));
  await assert.rejects(verifySiweLogin({ ...noExp, nonce: NONCE, domain: DOMAIN, now: NOW }), /expiry required/);
  const long = await signed(message({ expirationTime: new Date(NOW.getTime() + 60 * 60_000) }));
  await assert.rejects(verifySiweLogin({ ...long, nonce: NONCE, domain: DOMAIN, now: NOW }), /too long/);
});

test("the wrong nonce, domain or chain is refused", async () => {
  const m = await signed(message());
  await assert.rejects(verifySiweLogin({ ...m, nonce: "ffffffffffffffff", domain: DOMAIN, now: NOW }), /nonce/);
  await assert.rejects(verifySiweLogin({ ...m, nonce: NONCE, domain: "evil.example", now: NOW }), /domain/);
  const wrongChain = await signed(message({ chainId: 10 }));
  await assert.rejects(verifySiweLogin({ ...wrongChain, nonce: NONCE, domain: DOMAIN, now: NOW }), /chain/);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { blake3 } from "@noble/hashes/blake3";
import { hashTypedData } from "viem";
import {
  varint, pb, hex, unhex, concat, envelope, keyAdd, keyRemoveSelf, fcNow,
  signedKeyRequestTyped, keyAddTyped, MT, SCOPES, KEY_TTL_S, KEY_DEADLINE_S,
  type Signer, type Custody, type TypedData,
} from "./hypersnap-proto";

// An Ed25519 signer from WebCrypto, the same API the browser vault uses.
async function testSigner(): Promise<Signer & { verify: (sig: Uint8Array, m: Uint8Array) => Promise<boolean> }> {
  const pair = (await webcrypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])) as CryptoKeyPair;
  const pub = new Uint8Array(await webcrypto.subtle.exportKey("raw", pair.publicKey));
  return {
    pub,
    sign: async (m) => new Uint8Array(await webcrypto.subtle.sign({ name: "Ed25519" }, pair.privateKey, m)),
    verify: (sig, m) => webcrypto.subtle.verify({ name: "Ed25519" }, pair.publicKey, sig, m),
  };
}

// A protobuf reader just big enough to check what the writer produced.
function readFields(b: Uint8Array): Map<number, (number | Uint8Array)[]> {
  const out = new Map<number, (number | Uint8Array)[]>();
  let i = 0;
  const rv = () => { let n = 0, s = 0; for (;;) { const x = b[i++]; n += (x & 0x7f) * 2 ** s; s += 7; if (x < 0x80) return n; } };
  while (i < b.length) {
    const tag = rv(); const f = tag >> 3; const wt = tag & 7;
    const v = wt === 0 ? rv() : wt === 2 ? ((len) => b.slice(i, (i += len)))(rv()) : (() => { throw new Error("wire type " + wt); })();
    out.set(f, [...(out.get(f) ?? []), v]);
  }
  return out;
}

test("varints and fields encode as protobuf does", () => {
  assert.equal(hex(varint(1)), "01");
  assert.equal(hex(varint(300)), "ac02");
  assert.equal(hex(varint(2 ** 32 + 1)), "8180808010");
  assert.equal(hex(pb([1, 150])), "0896 01".replace(" ", ""));
  assert.equal(hex(pb([2, "testing"])), "120774657374696e67");
  assert.equal(hex(pb([4, [3, 270]])), "22 03 03 8e 02".replace(/ /g, ""));
  assert.equal(hex(pb([1, undefined], [2, ""], [3, []])), "", "empty fields are left out");
  assert.equal(hex(concat(unhex("0x0102"), unhex("03"))), "010203");
});

test("an envelope hashes data with blake3-160, signs the hash, and carries data twice", async () => {
  const k = await testSigner();
  const body = pb([1, "zm"]);
  const at = fcNow();
  const { msg, hash } = await envelope(MT.CAST_ADD, 19640, body, k, at);
  const f = readFields(msg);
  const data = f.get(1)![0] as Uint8Array;
  assert.deepEqual(f.get(7)![0], data, "data_bytes equals data");
  assert.equal(hash, "0x" + hex(blake3(data, { dkLen: 20 })));
  assert.deepEqual(f.get(2)![0], unhex(hash));
  assert.equal(f.get(3)![0], 1, "hash scheme blake3");
  assert.equal(f.get(5)![0], 1, "signature scheme ed25519");
  assert.deepEqual(f.get(6)![0], k.pub);
  assert.ok(await k.verify(f.get(4)![0] as Uint8Array, unhex(hash)), "signature is over the hash");
  const d = readFields(data);
  assert.equal(d.get(1)![0], MT.CAST_ADD);
  assert.equal(d.get(2)![0], 19640);
  assert.equal(d.get(3)![0], at);
  assert.equal(d.get(4)![0], 1, "mainnet");
  assert.deepEqual(d.get(5)![0], body, "cast body in field 5");
});

test("the typed data for the custody wallet is valid EIP-712 (viem hashes it) and names the key, scopes and deadline", () => {
  const key = new Uint8Array(32).fill(7);
  const skr = signedKeyRequestTyped(19640, key, 1000);
  const ka = keyAddTyped(19640, key, KEY_TTL_S, 5, 1000);
  for (const t of [skr, ka]) {
    const h = hashTypedData(t as Parameters<typeof hashTypedData>[0]);
    assert.match(h, /^0x[0-9a-f]{64}$/);
  }
  assert.equal(skr.message.key, "0x" + hex(key));
  assert.equal(ka.message.nonce, 5);
  assert.deepEqual(ka.message.scopes, SCOPES);
  assert.equal(ka.domain.name, "Farcaster KeyAdd");
  assert.equal(ka.domain.chainId, 1);
});

test("KEY_ADD carries the key, both custody signatures, scopes, ttl and an abi-encoded SignedKeyRequest; KEY_REMOVE is self-signed", async () => {
  const k = await testSigner();
  const asked: TypedData[] = [];
  const custody: Custody = {
    address: "0xb79cdabf6f2fb8fea70c2e515aec35e827bf7932",
    signTyped: async (t) => { asked.push(t); return "0x" + hex(new Uint8Array(65).fill(asked.length)); },
  };
  const now = fcNow();
  const { msg } = await keyAdd(19640, custody, k, 42, now);
  assert.deepEqual(asked.map((t) => t.primaryType), ["SignedKeyRequest", "KeyAdd"]);
  const data = readFields(msg).get(1)![0] as Uint8Array;
  const d = readFields(data);
  assert.equal(d.get(1)![0], MT.KEY_ADD);
  const body = readFields(d.get(19)![0] as Uint8Array);
  assert.deepEqual(body.get(1)![0], k.pub, "the new key");
  assert.equal(body.get(2)![0], 1, "key type ed25519");
  assert.deepEqual(body.get(3)![0], new Uint8Array(65).fill(2), "the KeyAdd signature");
  assert.equal(body.get(4)![0], now + KEY_DEADLINE_S);
  assert.equal(body.get(5)![0], 42, "nonce");
  assert.equal(body.get(10)![0], KEY_TTL_S);
  const scopes = body.get(9)![0] as Uint8Array;
  assert.deepEqual([...scopes], SCOPES, "packed scopes");
  const meta = body.get(6)![0] as Uint8Array;
  assert.equal(meta.length, 32 * 6 + 65 + 31, "abi.encode of (uint256, address, bytes, uint256)");
  assert.equal(BigInt("0x" + hex(meta.slice(32, 64))), BigInt(19640), "requestFid");
  assert.equal("0x" + hex(meta.slice(64 + 12, 96)), custody.address, "requestSigner");
  assert.deepEqual(meta.slice(192, 192 + 65), new Uint8Array(65).fill(1), "the SignedKeyRequest signature");

  const rm = await keyRemoveSelf(19640, k, 43, now);
  const rd = readFields(readFields(rm.msg).get(1)![0] as Uint8Array);
  assert.equal(rd.get(1)![0], MT.KEY_REMOVE);
  const rb = readFields(rd.get(20)![0] as Uint8Array);
  assert.deepEqual(rb.get(1)![0], k.pub);
  assert.equal(rb.get(3)![0], 2, "self-revocation");
  assert.equal(rb.get(5)![0], 43);
});

test("a custody signature that is not 65 bytes is refused before anything is built", async () => {
  const k = await testSigner();
  const bad: Custody = { address: "0x" + "11".repeat(20), signTyped: async () => "0x1234" };
  await assert.rejects(keyAdd(1, bad, k, 1), /65 bytes/);
});

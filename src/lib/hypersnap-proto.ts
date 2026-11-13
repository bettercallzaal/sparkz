// Hypersnap (Farcaster) protocol messages, built and hashed here so Sparkz can write to a
// node without a hosted API: a protobuf writer for the few fields we use, the Message
// envelope (blake3 hash, Ed25519 signature), and the gasless KEY_ADD / KEY_REMOVE that
// register this browser's signing key for a fid (ZAOresearch 2485, PR 2 of 3).
//
// Lifted from Quilcast (github.com/backmeupplz/quilcast, MIT, Nikita Kolmogorov), src/fc.ts,
// trimmed to what Sparkz needs; see NOTICE. Field numbers follow hypersnap
// proto/definitions/message.proto. Pure functions, no DOM: runs in the browser and in tests.
import { blake3 } from "@noble/hashes/blake3";

export const hex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
export const unhex = (s: string): Uint8Array => {
  const clean = s.replace(/^0x/, "");
  return Uint8Array.from(clean.match(/../g) ?? [], (x) => parseInt(x, 16));
};
const utf8 = (s: string) => new TextEncoder().encode(s);
export const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, x) => n + x.length, 0));
  let o = 0;
  for (const x of parts) {
    out.set(x, o);
    o += x.length;
  }
  return out;
};

// --- protobuf writer: varints and length-delimited fields are all we need ---

const SEVEN = BigInt(0x7f);
const CONT = BigInt(0x80);
export const varint = (v: number | bigint): Uint8Array => {
  let n = BigInt(v);
  const out: number[] = [];
  while (n >= CONT) {
    out.push(Number((n & SEVEN) | CONT));
    n >>= BigInt(7);
  }
  out.push(Number(n));
  return Uint8Array.from(out);
};

export type Field = [number, number | bigint | string | Uint8Array | number[] | undefined];
// numbers -> varint, strings/bytes -> length-delimited, number arrays -> packed varints
export const pb = (...fields: Field[]): Uint8Array =>
  concat(
    ...fields.flatMap(([f, v]): Uint8Array[] => {
      if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) return [];
      if (typeof v === "number" || typeof v === "bigint") return [varint(f << 3), varint(v)];
      const b = typeof v === "string" ? utf8(v) : Array.isArray(v) ? concat(...v.map(varint)) : v;
      return [varint((f << 3) | 2), varint(b.length), b];
    }),
  );

export const MT = {
  CAST_ADD: 1, CAST_REMOVE: 2, REACTION_ADD: 3, REACTION_REMOVE: 4,
  LINK_ADD: 5, LINK_REMOVE: 6, USER_DATA_ADD: 11, KEY_ADD: 16, KEY_REMOVE: 17,
} as const;
// What the browser's key may sign: casts, reactions, follows and profile edits. Never
// KEY_ADD/KEY_REMOVE for other keys, verifications, username proofs or storage.
export const SCOPES: number[] = [MT.CAST_ADD, MT.CAST_REMOVE, MT.REACTION_ADD, MT.REACTION_REMOVE, MT.LINK_ADD, MT.LINK_REMOVE, MT.USER_DATA_ADD];
const BODY_FIELD: Record<number, number> = { 1: 5, 2: 6, 3: 7, 4: 7, 5: 14, 6: 14, 11: 12, 16: 19, 17: 20 };

// Farcaster time: seconds since 2021-01-01T00:00:00Z.
export const FARCASTER_EPOCH_S = 1609459200;
export const fcNow = (nowMs = Date.now()): number => Math.floor(nowMs / 1000) - FARCASTER_EPOCH_S;

/** A signing key: public key bytes and a signer. The private half never leaves the vault. */
export type Signer = { pub: Uint8Array; sign: (message: Uint8Array) => Promise<Uint8Array> };

/** Sign MessageData with the Ed25519 signer and return the Message envelope plus its hash.
 *  The node hashes `data_bytes` (field 7) and reads `data` (field 1), so both are sent. */
export async function envelope(type: number, fid: number, body: Uint8Array, key: Signer, at = fcNow()): Promise<{ msg: Uint8Array; hash: string }> {
  const data = pb([1, type], [2, fid], [3, at], [4, 1], [BODY_FIELD[type], body]);
  const hash = blake3(data, { dkLen: 20 });
  const sig = await key.sign(hash);
  const msg = pb([1, data], [2, hash], [3, 1], [4, sig], [5, 1], [6, key.pub], [7, data]);
  return { msg, hash: "0x" + hex(hash) };
}

// --- EIP-712 typed data the custody wallet signs (shapes viem/wagmi signTypedData take) ---

const KEY_ADD_DOMAIN = { name: "Farcaster KeyAdd", version: "1", chainId: 1 } as const;
const word = (v: number | bigint | string): Uint8Array => unhex(BigInt(v).toString(16).padStart(64, "0"));

export type TypedData = {
  domain: typeof KEY_ADD_DOMAIN;
  types: Record<string, { name: string; type: string }[]>;
  primaryType: string;
  message: Record<string, unknown>;
};

/** The SignedKeyRequest the custody signs for its own fid (requestFid = fid). */
export const signedKeyRequestTyped = (fid: number, key: Uint8Array, deadline: number): TypedData => ({
  domain: KEY_ADD_DOMAIN,
  primaryType: "SignedKeyRequest",
  types: { SignedKeyRequest: [{ name: "requestFid", type: "uint256" }, { name: "key", type: "bytes" }, { name: "deadline", type: "uint256" }] },
  message: { requestFid: BigInt(fid), key: ("0x" + hex(key)) as `0x${string}`, deadline: BigInt(deadline) },
});

/** The KeyAdd the custody signs: which key, what it may do, for how long. */
export const keyAddTyped = (fid: number, key: Uint8Array, ttl: number, nonce: number, deadline: number): TypedData => ({
  domain: KEY_ADD_DOMAIN,
  primaryType: "KeyAdd",
  types: {
    KeyAdd: [
      { name: "fid", type: "uint256" }, { name: "key", type: "bytes" }, { name: "keyType", type: "uint32" },
      { name: "scopes", type: "uint32[]" }, { name: "ttl", type: "uint32" }, { name: "nonce", type: "uint32" }, { name: "deadline", type: "uint256" },
    ],
  },
  message: { fid: BigInt(fid), key: ("0x" + hex(key)) as `0x${string}`, keyType: 1, scopes: SCOPES, ttl, nonce, deadline: BigInt(deadline) },
});

/** Whoever holds the custody address: a connected wallet that signs typed data (65-byte sig, hex). */
export type Custody = { address: string; signTyped: (t: TypedData) => Promise<string> };

export const KEY_TTL_S = 90 * 86400;
export const KEY_DEADLINE_S = 3600;

/** KEY_ADD registering `signer` for `fid` with no on-chain transaction (Hypersnap gasless signers).
 *  Two custody signatures: the SignedKeyRequest (goes in the metadata, abi-encoded as the
 *  SignedKeyRequestValidator expects) and the KeyAdd itself. */
export async function keyAdd(fid: number, custody: Custody, signer: Signer, nonce: number, now = fcNow()) {
  const key = signer.pub;
  // the node checks the deadline against the message timestamp, so both count from the Farcaster epoch
  const deadline = now + KEY_DEADLINE_S;
  const skr = unhex(await custody.signTyped(signedKeyRequestTyped(fid, key, deadline)));
  if (skr.length !== 65) throw new Error("custody signature must be 65 bytes");
  // abi.encode((uint256 requestFid, address requestSigner, bytes signature, uint256 deadline))
  const metadata = concat(word(32), word(fid), word(custody.address), word(128), word(deadline), word(65), skr, new Uint8Array(31));
  const custodySig = unhex(await custody.signTyped(keyAddTyped(fid, key, KEY_TTL_S, nonce, deadline)));
  if (custodySig.length !== 65) throw new Error("custody signature must be 65 bytes");
  const body = pb([1, key], [2, 1], [3, custodySig], [4, deadline], [5, nonce], [6, metadata], [7, 1], [9, SCOPES], [10, KEY_TTL_S]);
  return envelope(MT.KEY_ADD, fid, body, signer, now);
}

/** KEY_REMOVE signed by the key itself (Hypersnap self-revocation): no custody signature. */
export const keyRemoveSelf = (fid: number, signer: Signer, nonce: number, now = fcNow()) =>
  envelope(MT.KEY_REMOVE, fid, pb([1, signer.pub], [3, 2], [4, now + KEY_DEADLINE_S], [5, nonce]), signer, now);

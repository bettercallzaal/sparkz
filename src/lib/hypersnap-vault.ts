// The browser's Hypersnap signing key, one per fid, kept in IndexedDB as a non-extractable
// WebCrypto Ed25519 key: page code can sign with it, nothing can read it out, and it never
// reaches our server (the rule: Sparkz holds no user keys). Shape lifted from Quilcast's
// src/keys.ts (MIT), trimmed: no sealed secrets, no raw-key fallback. A browser without
// WebCrypto Ed25519 (Chrome before 113, Safari before 17) gets a clear error instead.
import type { Signer } from "./hypersnap-proto";

const DB = "sparkz-hypersnap";
const STORE = "signers";
const ED = { name: "Ed25519" };

let opened: Promise<IDBDatabase> | undefined;
const db = () =>
  (opened ||= new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("this browser has no IndexedDB"));
    const late = setTimeout(() => reject(new Error("IndexedDB did not open")), 4000);
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => { clearTimeout(late); resolve(r.result); };
    r.onerror = () => { clearTimeout(late); reject(r.error); };
  }).catch((e) => { opened = undefined; throw e; }));

async function kv<T>(mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode, { durability: "strict" });
    const r = f(t.objectStore(STORE));
    t.oncomplete = () => resolve(r.result as T);
    t.onerror = t.onabort = () => reject(t.error ?? r.error);
  });
}

type Stored = { key: CryptoKey; pub: Uint8Array; at: number };
const keyName = (fid: number) => `signer:${fid}`;

const asSigner = (s: Stored): Signer & { at: number } => ({
  pub: s.pub,
  at: s.at,
  sign: async (m) => new Uint8Array(await crypto.subtle.sign(ED, s.key, m as BufferSource)),
});

/** The signer this browser holds for `fid`, or null. */
export async function signerFor(fid: number): Promise<(Signer & { at: number }) | null> {
  const s = await kv<Stored | undefined>("readonly", (st) => st.get(keyName(fid)));
  return s ? asSigner(s) : null;
}

/** A fresh non-extractable Ed25519 key for `fid`, stored, read back and made to sign once
 *  before anyone relies on it. Replaces any key held before. */
export async function newSigner(fid: number): Promise<Signer & { at: number }> {
  let pair: CryptoKeyPair;
  try {
    pair = (await crypto.subtle.generateKey(ED, false, ["sign", "verify"])) as CryptoKeyPair;
  } catch {
    throw new Error("this browser cannot make an Ed25519 key (needs Chrome 113+, Safari 17+ or Firefox 130+)");
  }
  const pub = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  const stored: Stored = { key: pair.privateKey, pub, at: Date.now() };
  await kv("readwrite", (st) => st.put(stored, keyName(fid)));
  const back = await signerFor(fid);
  if (!back) throw new Error("the key did not come back from storage");
  const probe = crypto.getRandomValues(new Uint8Array(32));
  const sig = await back.sign(probe);
  const ok = await crypto.subtle.verify(ED, pair.publicKey, sig as BufferSource, probe as BufferSource);
  if (!ok) throw new Error("the stored key does not sign");
  return back;
}

export const dropSigner = (fid: number) => kv<undefined>("readwrite", (st) => st.delete(keyName(fid)));

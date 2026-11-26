import { test } from "node:test";
import assert from "node:assert/strict";
import {
  savePendingTx,
  loadPendingTx,
  clearPendingTx,
  pendingKey,
  isPermanentLinkError,
  type KeyValueStore,
} from "./pending-tx";

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k)! : null),
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const H1 = "68ff071c-7ded-4e86-98db-2a7e8acb89c9";
const H2 = "11111111-2222-4333-8444-555555555555";
const HASH = "0x" + "ab".repeat(32);

test("a sent hash survives a reload (read back from the same storage)", () => {
  const store = memoryStore();
  savePendingTx(store, H1, HASH);
  // A reload: the component state is gone, only storage remains.
  assert.equal(loadPendingTx(store, H1), HASH);
});

test("pending hashes are per Hearth", () => {
  const store = memoryStore();
  savePendingTx(store, H1, HASH);
  assert.equal(loadPendingTx(store, H2), null);
});

test("clear removes it once linked", () => {
  const store = memoryStore();
  savePendingTx(store, H1, HASH);
  clearPendingTx(store, H1);
  assert.equal(loadPendingTx(store, H1), null);
});

test("a malformed value is neither saved nor loaded", () => {
  const store = memoryStore();
  savePendingTx(store, H1, "0x1234");
  assert.equal(store.data.size, 0);
  store.setItem(pendingKey(H1), "not-a-hash");
  assert.equal(loadPendingTx(store, H1), null);
});

test("no storage or throwing storage never breaks the form", () => {
  assert.equal(loadPendingTx(null, H1), null);
  savePendingTx(null, H1, HASH);
  clearPendingTx(null, H1);
  const broken: KeyValueStore = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("quota");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
  assert.doesNotThrow(() => savePendingTx(broken, H1, HASH));
  assert.equal(loadPendingTx(broken, H1), null);
  assert.doesNotThrow(() => clearPendingTx(broken, H1));
});

test("only unfixable link errors drop the pending hash", () => {
  assert.equal(isPermanentLinkError(400, "Not a poidh bounty: transaction reverted"), true);
  assert.equal(isPermanentLinkError(400, "That bounty is already linked to another Hearth."), true);
  assert.equal(isPermanentLinkError(400, "That transaction is not confirmed on Base yet. Try again in a moment."), false);
  assert.equal(isPermanentLinkError(401, "Not a poidh bounty"), false);
  assert.equal(isPermanentLinkError(403, "That wallet is not on the Hearth owner's Farcaster account. Send the bounty from your primary or a verified wallet."), true);
  assert.equal(isPermanentLinkError(403, "Forbidden"), false);
  assert.equal(isPermanentLinkError(503, "Sparkz could not check the owner's Farcaster wallets right now. Try again in a minute."), false);
  assert.equal(isPermanentLinkError(500, undefined), false);
});

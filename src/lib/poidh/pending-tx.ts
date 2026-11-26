// A bounty transaction the owner's wallet has SENT but Sparkz has not yet linked to the
// Hearth. Kept in the browser (localStorage) so a reload or a closed tab does not lose the
// hash: the bounty and its ETH are already on poidh, and the form can still link it with
// "Retry linking" without ever signing again. Pure over a tiny storage interface, so it is
// unit-tested without a browser.

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const TX_HASH = /^0x[0-9a-fA-F]{64}$/;

export const pendingKey = (hearthId: string) => `sparkz:poidh-pending-tx:${hearthId}`;

export function savePendingTx(store: KeyValueStore | null, hearthId: string, hash: string): void {
  if (!store || !TX_HASH.test(hash)) return;
  try {
    store.setItem(pendingKey(hearthId), hash);
  } catch {
    // Storage full or blocked: the in-memory copy still covers this page view.
  }
}

export function loadPendingTx(store: KeyValueStore | null, hearthId: string): string | null {
  if (!store) return null;
  try {
    const v = store.getItem(pendingKey(hearthId));
    return v && TX_HASH.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function clearPendingTx(store: KeyValueStore | null, hearthId: string): void {
  if (!store) return;
  try {
    store.removeItem(pendingKey(hearthId));
  } catch {
    // Nothing to do.
  }
}

// The browser's localStorage, or null where there is none (server render, blocked storage).
export function browserStore(): KeyValueStore | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

// A link failure that retrying can never fix: the transaction is not a poidh bounty from
// this wallet (reverted, wrong contract), it is already on another Hearth, or it was sent
// from a wallet that is not on the owner's Farcaster account (403). The pending hash is
// dropped so the owner is not stuck behind "Retry linking" forever. A 503 (the owner's
// wallets could not be read yet) stays retryable.
export function isPermanentLinkError(status: number, error: unknown): boolean {
  if (typeof error !== "string") return false;
  if (status === 403) return /^That wallet is not on the Hearth owner's Farcaster account/.test(error);
  if (status !== 400) return false;
  return /^Not a poidh bounty|already linked to another Hearth/.test(error);
}

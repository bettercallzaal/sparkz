// A per-process sliding window for public, read-only routes that have no database row
// to count (the Hypersnap profile route). Memory only: each server instance keeps its
// own window, so the cap is per instance, not global. It stops one caller looping over
// fids from turning Sparkz into an amplifier against a third party's public node; it
// is not a defence against a distributed flood (see rate-limit.ts for the durable ones).
const windows = new Map<string, number[]>();
const MAX_KEYS = 10_000;

// Sign-in (nonce, SIWE, SIWF, Quick Auth), per IP across all four routes. Each SIWF
// verify calls a public Optimism RPC, so an unthrottled caller could get the server's
// address throttled there and block sign-in for everyone. 30 per 10 minutes is far
// above a person signing in, even with retries.
export const SIGN_IN_LIMIT = 30;
export const SIGN_IN_WINDOW_MS = 10 * 60 * 1000;

export const HYPERSNAP_READ_LIMIT = 60;
export const HYPERSNAP_READ_WINDOW_MS = 60 * 1000;

// True when `key` has already made `limit` calls inside the window; the call is then
// refused and not counted. False records the call.
export function memoryLimitHit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  if (windows.size > MAX_KEYS) windows.clear();
  const since = now - windowMs;
  const hits = (windows.get(key) ?? []).filter((t) => t > since);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return true;
  }
  hits.push(now);
  windows.set(key, hits);
  return false;
}

export function resetMemoryLimits(): void {
  windows.clear();
}

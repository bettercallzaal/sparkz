// The canonical, trusted origin for Sparkz. NEVER derive an outbound/approval URL
// from the request (req.nextUrl.origin / Host header) - that is attacker-controlled
// and lets a spoofed Host inject a phishing domain into links we send to operators
// (Discord approval links, etc). Read the canonical origin from server env instead.
//
// Set SPARKZ_ORIGIN in prod (e.g. https://trysparkz.com). Falls back to the known
// production domain so links are never broken, but the env var should always be set.

// The canonical host + URL as PLAIN LITERALS - the single source of truth for the
// domain. Use these (not canonicalOrigin()) in the two places that can't read the
// server-only SPARKZ_ORIGIN env var and must be pinned to the exact FQDN:
//   1. Client components ("use client") - SPARKZ_ORIGIN is not bundled to the browser.
//   2. Cryptographically domain-bound configs - the SIWE `domain` field and the
//      Farcaster manifest `canonicalDomain` are signed for this exact host; changing
//      the domain requires re-signing, not just an env swap. Defining it once here
//      means a domain move is a single edit (plus the re-sign).
export const CANONICAL_HOST = "trysparkz.com";
export const CANONICAL_URL = `https://${CANONICAL_HOST}`;

const DEFAULT_ORIGIN = CANONICAL_URL;

export function canonicalOrigin(): string {
  const raw = process.env.SPARKZ_ORIGIN?.trim();
  if (!raw) return DEFAULT_ORIGIN;
  // Strip any trailing slash so callers can safely template `${origin}/path`.
  return raw.replace(/\/+$/, "");
}

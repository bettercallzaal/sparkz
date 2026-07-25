// The canonical, trusted origin for Sparkz. NEVER derive an outbound/approval URL
// from the request (req.nextUrl.origin / Host header) - that is attacker-controlled
// and lets a spoofed Host inject a phishing domain into links we send to operators
// (Discord approval links, etc). Read the canonical origin from server env instead.
//
// Set SPARKZ_ORIGIN in prod (e.g. https://trysparkz.com). Falls back to the known
// production domain so links are never broken, but the env var should always be set.
const DEFAULT_ORIGIN = "https://trysparkz.com";

export function canonicalOrigin(): string {
  const raw = process.env.SPARKZ_ORIGIN?.trim();
  if (!raw) return DEFAULT_ORIGIN;
  // Strip any trailing slash so callers can safely template `${origin}/path`.
  return raw.replace(/\/+$/, "");
}

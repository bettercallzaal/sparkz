import { NextResponse } from "next/server";
import type { z } from "zod";
import type { NextRequest } from "next/server";
import { CANONICAL_URL, canonicalOrigin } from "@/lib/origin";

// Consistent JSON responses. Never leak internals: log the real error server-side,
// return a sanitized message to the client.

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, details },
    { status: 400 },
  );
}

export function tooManyRequests(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 429 });
}

export function serverError(err: unknown, where: string) {
  console.error(`[sparkz:${where}]`, err);
  return NextResponse.json(
    { ok: false, error: "Internal error" },
    { status: 500 },
  );
}

export function zodError(result: z.ZodError) {
  return badRequest(
    "Invalid input",
    result.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  );
}

// Hosts that serve this app. The mini app runs on trysparkz.com inside the
// Farcaster iframe, so its requests carry that Origin too.
const APP_ORIGINS = new Set([CANONICAL_URL, "https://sparkz.lol", "https://www.sparkz.lol"]);

// CSRF guard for state-changing routes that act on the session cookie. The cookie is
// SameSite=None (it must survive the Farcaster iframe), so the browser attaches it
// to cross-site POSTs, including no-cors text/plain ones that skip preflight. A
// browser always sends Origin on such a POST; reject any Origin that is not ours.
// A request with no Origin is not from a browser page, so it carries no victim
// cookie (operator scripts use the token header).
// True when the browser says this request came from another site: an Origin that is
// not ours, or Sec-Fetch-Site: cross-site (sent by modern browsers on every request,
// including no-cors GETs that carry no Origin). Non-browser clients send neither.
export function isCrossSite(req: NextRequest): boolean {
  if (req.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (APP_ORIGINS.has(origin) || origin === canonicalOrigin()) return false;
  if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return false;
  }
  return true;
}

export function forbidCrossSite(req: NextRequest): NextResponse | null {
  if (!isCrossSite(req)) return null;
  return NextResponse.json({ ok: false, error: "Cross-site request refused" }, { status: 403 });
}

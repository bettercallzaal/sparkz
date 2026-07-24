import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Two-domain split (see src/lib/origins.ts):
// - trysparkz.com (and the default) serve the SEO/GEO marketing homepage at `/`.
// - sparkz.lol is the app - its `/` sends visitors into the app at /explore. Every
//   app path (/explore, /start, /profile, /c/..., /admin) is served on both hosts, so
//   cross-domain app links resolve; sparkz.lol just makes the app its front door.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const url = req.nextUrl;

  if (url.pathname !== "/") return NextResponse.next();

  if (host.includes("sparkz.lol")) {
    url.pathname = "/explore";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: "/" };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Map each domain to its landing page at the root path, so pointing DNS is all
// that's needed - no per-domain deploy. Subpaths (/admin, /audit, /c/...) are
// untouched and shared across every host.
//   trysparkz.com  -> /try
//   sparkz.lol     -> /lol
//   anything else  -> / (the canonical Sparkz brand page)
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const url = req.nextUrl;

  if (url.pathname !== "/") return NextResponse.next();

  if (host.includes("trysparkz")) {
    url.pathname = "/try";
    return NextResponse.rewrite(url);
  }
  if (host.endsWith("sparkz.lol") || host.includes("sparkz.lol")) {
    url.pathname = "/lol";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: "/" };

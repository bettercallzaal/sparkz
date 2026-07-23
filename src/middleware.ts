import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// trysparkz.com (and the default) serve the canonical redesigned homepage at `/`.
// sparkz.lol gets its own culture-angle landing at /lol. Subpaths (/admin, /c/...,
// /start) are shared across every host.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const url = req.nextUrl;

  if (url.pathname !== "/") return NextResponse.next();

  if (host.includes("sparkz.lol")) {
    url.pathname = "/lol";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: "/" };

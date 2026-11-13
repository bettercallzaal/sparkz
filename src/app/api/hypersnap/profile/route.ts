import type { NextRequest } from "next/server";
import { ok, badRequest, serverError, tooManyRequests } from "@/lib/http";
import { getProfile, getFidByName, CACHE_SECONDS } from "@/lib/hypersnap";
import { clientIpHash } from "@/lib/rate-limit";
import { memoryLimitHit, HYPERSNAP_READ_LIMIT, HYPERSNAP_READ_WINDOW_MS } from "@/lib/memory-limit";

export const dynamic = "force-dynamic";

// GET /api/hypersnap/profile?fid=19640 or ?name=zaal - a Farcaster profile straight from
// the Hypersnap node: username, display name, pfp, bio, url, twitter, primary address.
// All of it is public network data the user set themselves. Null when the node has no
// profile for that fid or does not answer. Public and unauthenticated, so two caps keep it
// from amplifying traffic onto the node: a per-IP limit per minute, and a CDN cache header
// so the same fid is served from the edge for CACHE_SECONDS.
export async function GET(req: NextRequest) {
  try {
    if (memoryLimitHit(`hypersnap:${clientIpHash(req)}`, HYPERSNAP_READ_LIMIT, HYPERSNAP_READ_WINDOW_MS)) {
      return tooManyRequests("too many profile reads, try again in a minute");
    }
    const name = req.nextUrl.searchParams.get("name");
    const fidParam = req.nextUrl.searchParams.get("fid");
    let fid = fidParam ? Number(fidParam) : NaN;
    if (!Number.isInteger(fid) && name) fid = (await getFidByName(name)) ?? NaN;
    if (!Number.isInteger(fid) || fid <= 0) return badRequest("fid or name required");
    const res = ok(await getProfile(fid));
    res.headers.set("cache-control", `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`);
    return res;
  } catch (err) {
    return serverError(err, "hypersnap.profile.GET");
  }
}

import type { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/http";
import { getProfile, getFidByName } from "@/lib/hypersnap";

export const dynamic = "force-dynamic";

// GET /api/hypersnap/profile?fid=19640 or ?name=zaal - a Farcaster profile straight from
// the Hypersnap node: username, display name, pfp, bio, url, twitter, primary address.
// All of it is public network data the user set themselves. Null when the node has no
// profile for that fid or does not answer.
export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get("name");
    const fidParam = req.nextUrl.searchParams.get("fid");
    let fid = fidParam ? Number(fidParam) : NaN;
    if (!Number.isInteger(fid) && name) fid = (await getFidByName(name)) ?? NaN;
    if (!Number.isInteger(fid) || fid <= 0) return badRequest("fid or name required");
    return ok(await getProfile(fid));
  } catch (err) {
    return serverError(err, "hypersnap.profile.GET");
  }
}

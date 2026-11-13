import type { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/http";
import { signerListed } from "@/lib/hypersnap";

export const dynamic = "force-dynamic";

// GET /api/hypersnap/signer?fid=19640&signer=0x<64 hex>: does the node list this Ed25519
// key as an active signer for the fid. The browser asks this after a KEY_ADD to know the
// key landed, and on the profile page to show on/off. Public data, read fresh (no cache).
export async function GET(req: NextRequest) {
  try {
    const fid = Number(req.nextUrl.searchParams.get("fid"));
    const signer = (req.nextUrl.searchParams.get("signer") ?? "").toLowerCase();
    if (!Number.isSafeInteger(fid) || fid <= 0) return badRequest("fid required");
    if (!/^0x[0-9a-f]{64}$/.test(signer)) return badRequest("signer must be 0x + 64 hex");
    return ok({ fid, signer, listed: await signerListed(fid, signer) });
  } catch (err) {
    return serverError(err, "hypersnap.signer.GET");
  }
}

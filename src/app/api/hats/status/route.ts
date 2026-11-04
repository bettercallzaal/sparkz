import type { NextRequest } from "next/server";
import type { Address } from "viem";
import { isAddress } from "viem";
import { badRequest, ok, serverError } from "@/lib/http";
import { sessionClaims } from "@/lib/session";
import { hatSupply, hatsClaimable, hatsConfig, isWearer, prettyHatId } from "@/lib/hats";

// GET /api/hats/status[?address=0x...] - is the first free hat switched on, how many are
// out, and does this wallet (the query address, else the signed-in one) wear it. Public
// reads only; everything here is already visible on chain. The browser claims the hat itself
// (claimHat on the claims module, from the member's own wallet), so it gets the hat id and
// module address here. No server key, no server mint.
export async function GET(req: NextRequest) {
  try {
    const cfg = hatsConfig();
    if (!cfg) return ok({ configured: false, canMint: false, hat: null, hatId: null, claimsHatter: null, supply: null, address: null, worn: false });

    const query = req.nextUrl.searchParams.get("address");
    if (query && !isAddress(query)) return badRequest("Not an address.");
    const address = (query ?? sessionClaims(req)?.address ?? null) as Address | null;

    const [supply, worn, canMint] = await Promise.all([
      hatSupply(cfg).catch(() => null),
      hatsClaimable(cfg).catch(() => false),
      address ? isWearer(address, cfg).catch(() => false) : Promise.resolve(false),
    ]);
    return ok({ configured: true, canMint, hat: prettyHatId(cfg.hatId), hatId: cfg.hatId.toString(), claimsHatter: cfg.claimsHatter, supply, address, worn });
  } catch (err) {
    return serverError(err, "hats.status.GET");
  }
}

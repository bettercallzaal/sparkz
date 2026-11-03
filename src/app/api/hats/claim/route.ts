import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Address } from "viem";
import { forbidCrossSite, ok, serverError, tooManyRequests } from "@/lib/http";
import { sessionClaims } from "@/lib/session";
import { clientIpHash } from "@/lib/rate-limit";
import { HatsMintError, hatsCanMint, hatsConfigured, mintMemberHat, prettyHatId, hatsConfig } from "@/lib/hats";

// POST /api/hats/claim - the first free hat. The signed-in wallet (Sign-In with Ethereum
// session, lib/session.ts) gets the ZAO Member hat minted to it by the relayer, gas on
// The ZAO. One hat per wallet by protocol; a repeat call reads as success.
//
// Soft per-IP cap, in memory: this is a free mint paid in the relayer's gas, so a script
// should not be able to drain it. The hard cap is the hat's own max supply on chain.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const recent = new Map<string, number[]>();

function overCap(ipHash: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ipHash) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ipHash, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    if (!hatsConfigured() || !hatsCanMint()) {
      return NextResponse.json({ ok: false, error: "Free hats are not switched on yet." }, { status: 503 });
    }
    const address = sessionClaims(req)?.address;
    if (!address) {
      return NextResponse.json({ ok: false, error: "Sign in with your wallet first." }, { status: 401 });
    }
    if (overCap(clientIpHash(req))) return tooManyRequests("Too many hats from here. Try again in an hour.");

    const result = await mintMemberHat(address as Address);
    return ok({ worn: true, already: result.already, tx: result.tx, hat: prettyHatId(hatsConfig()!.hatId) }, result.already ? 200 : 201);
  } catch (err) {
    if (err instanceof HatsMintError) {
      console.error("[sparkz:hats.claim]", err.message);
      return NextResponse.json({ ok: false, error: "The hat could not be minted right now." }, { status: 503 });
    }
    return serverError(err, "hats.claim.POST");
  }
}

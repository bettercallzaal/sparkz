import { NextResponse, type NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireHearthOwner, isAdmin } from "@/lib/auth";
import { ok, badRequest, serverError, zodError, tooManyRequests, forbidCrossSite } from "@/lib/http";
import { recordBountySchema, hearthBountyQuery } from "@/lib/validation/schemas";
import { baseClient } from "@/lib/poidh/client";
import { parseCreatedBounty } from "@/lib/poidh/receipt";
import { listHearthBounties } from "@/lib/poidh/hearth-bounties";
import { POIDH_CONTRACT_ADDRESS } from "@/lib/poidh/abi";
import { checkOwnerWallet, WRONG_WALLET_MESSAGE, WALLETS_UNAVAILABLE_MESSAGE } from "@/lib/poidh/owner-wallets";
import type { Hex } from "viem";

// GET  /api/hearth-bounties?hearth_id=... - a Hearth's poidh bounties with live state read
//      from Base (public, like the Hearth page).
// POST /api/hearth-bounties - record a bounty AFTER the owner's own wallet sent
//      createOpenBounty on Base. Body { hearth_id, tx_hash }. Owner-or-operator only. The
//      server re-reads the receipt and saves nothing unless it is a successful
//      BountyCreated from the poidh contract, and only when the bounty came from a wallet
//      the Hearth owner controls (lib/poidh/owner-wallets.ts). Sparkz never sends the transaction,
//      holds funds or has a key.

export async function GET(req: NextRequest) {
  try {
    const parsed = hearthBountyQuery.safeParse({ hearth_id: req.nextUrl.searchParams.get("hearth_id") });
    if (!parsed.success) return zodError(parsed.error);
    return ok({ bounties: await listHearthBounties(parsed.data.hearth_id) });
  } catch (err) {
    return serverError(err, "hearth-bounties.GET");
  }
}

// Small in-process throttle for the RPC-backed POST (owner-only already; this stops loops).
const recent = new Map<string, number[]>();
function throttled(key: string): boolean {
  const now = Date.now();
  // Evict keys with no hit in the last minute so the Map cannot grow without bound.
  for (const [k, ts] of recent) if (ts.every((t) => now - t >= 60_000)) recent.delete(k);
  const hits = (recent.get(key) ?? []).filter((t) => now - t < 60_000);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > 10;
}

export async function POST(req: NextRequest) {
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    const body = await req.json().catch(() => null);
    const parsed = recordBountySchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const { hearth_id, tx_hash } = parsed.data;

    const denied = await requireHearthOwner(req, hearth_id);
    if (denied) return denied;
    if (!isAdmin(req) && throttled(hearth_id)) return tooManyRequests("Slow down and try again in a minute.");

    let receipt;
    try {
      receipt = await baseClient().getTransactionReceipt({ hash: tx_hash as Hex });
    } catch {
      // Not mined yet, or an unknown hash. Never save optimistically.
      return badRequest("That transaction is not confirmed on Base yet. Try again in a moment.");
    }
    const result = parseCreatedBounty({
      status: receipt.status,
      from: receipt.from,
      to: receipt.to ?? null,
      logs: receipt.logs.map((l) => ({ address: l.address, data: l.data, topics: l.topics })),
    });
    if (!result.ok) return badRequest(`Not a poidh bounty: ${result.reason}`);

    // The caller owning the Hearth is not enough: the bounty must come from one of the
    // owner's wallets, or an owner could put someone else's bounty on their Hearth. The
    // operator may record a bounty from any wallet. A Farcaster record that cannot be read
    // is a 503 (try again), not a refusal.
    if (!isAdmin(req)) {
      const owns = await checkOwnerWallet(hearth_id, result.bounty.issuer);
      if (owns === "unavailable") return NextResponse.json({ ok: false, error: WALLETS_UNAVAILABLE_MESSAGE }, { status: 503 });
      if (owns === "no") return NextResponse.json({ ok: false, error: WRONG_WALLET_MESSAGE }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { data: existing, error: dupErr } = await supabase
      .from("hearth_bounties")
      .select("id, hearth_id")
      .eq("tx_hash", tx_hash.toLowerCase())
      .limit(1);
    if (dupErr) throw dupErr;
    if (Array.isArray(existing) && existing.length > 0) {
      if (existing[0].hearth_id !== hearth_id) return badRequest("That bounty is already linked to another Hearth.");
      return ok({ recorded: true, deduped: true, bounty_id: result.bounty.bountyId }, 200);
    }

    const { error } = await supabase.from("hearth_bounties").insert({
      hearth_id,
      chain: "base",
      contract_address: POIDH_CONTRACT_ADDRESS.toLowerCase(),
      bounty_id: result.bounty.bountyId,
      issuer_address: result.bounty.issuer,
      tx_hash: tx_hash.toLowerCase(),
    });
    if (error?.code === "23505") return ok({ recorded: true, deduped: true, bounty_id: result.bounty.bountyId }, 200);
    if (error) throw error;
    return ok({ recorded: true, bounty_id: result.bounty.bountyId }, 201);
  } catch (err) {
    return serverError(err, "hearth-bounties.POST");
  }
}


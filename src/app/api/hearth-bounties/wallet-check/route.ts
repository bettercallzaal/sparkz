import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireHearthOwner, isAdmin } from "@/lib/auth";
import { ok, serverError, zodError } from "@/lib/http";
import { checkOwnerWallet, WRONG_WALLET_MESSAGE, WALLETS_UNAVAILABLE_MESSAGE } from "@/lib/poidh/owner-wallets";

// GET /api/hearth-bounties/wallet-check?hearth_id=...&wallet=0x... - owner or operator only.
// Asked by the New bounty form BEFORE the wallet signs, so an owner is told up front when
// the connected wallet would not be accepted, instead of after paying on Base. The same
// check runs again in POST /api/hearth-bounties; this read decides nothing on its own.
const query = z.object({
  hearth_id: z.string().uuid(),
  wallet: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
});

export async function GET(req: NextRequest) {
  try {
    const parsed = query.safeParse({
      hearth_id: req.nextUrl.searchParams.get("hearth_id"),
      wallet: req.nextUrl.searchParams.get("wallet"),
    });
    if (!parsed.success) return zodError(parsed.error);
    const denied = await requireHearthOwner(req, parsed.data.hearth_id);
    if (denied) return denied;
    if (isAdmin(req)) return ok({ check: "yes" });

    const check = await checkOwnerWallet(parsed.data.hearth_id, parsed.data.wallet);
    if (check === "unavailable") return NextResponse.json({ ok: false, check, error: WALLETS_UNAVAILABLE_MESSAGE }, { status: 503 });
    if (check === "no") return ok({ check, error: WRONG_WALLET_MESSAGE });
    return ok({ check });
  } catch (err) {
    return serverError(err, "hearth-bounties.wallet-check.GET");
  }
}

import type { NextRequest } from "next/server";
import "@/lib/adapters/bootstrap";
import { createBackingSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { getBackingProvider } from "@/lib/adapters/backing-provider";

// GET /api/backers?capsule_id=...&provider=ledger - list backings for a capsule.
export async function GET(req: NextRequest) {
  try {
    const capsuleId = req.nextUrl.searchParams.get("capsule_id");
    if (!capsuleId) return badRequest("capsule_id is required");
    const providerId = req.nextUrl.searchParams.get("provider") ?? "ledger";

    const provider = getBackingProvider(providerId);
    if (!provider) return badRequest(`unknown backing provider: ${providerId}`);

    const backings = await provider.listBackings(capsuleId);
    return ok(backings);
  } catch (err) {
    return serverError(err, "backers.GET");
  }
}

// POST /api/backers - record a pre-token "spark" backing through a provider
// (m1: ledger, off-chain). Provider-agnostic so on-chain rails slot in later.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createBackingSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const input = parsed.data;

    const providerId = input.provider ?? "ledger";
    const provider = getBackingProvider(providerId);
    if (!provider) return badRequest(`unknown backing provider: ${providerId}`);

    const record = await provider.createBacking({
      capsuleId: input.capsule_id,
      backerKind: input.backer_kind,
      backerId: input.backer_id,
      kind: input.kind,
      amountOrQty: input.amount_or_qty,
      unit: input.unit,
    });
    return ok(record, 201);
  } catch (err) {
    return serverError(err, "backers.POST");
  }
}

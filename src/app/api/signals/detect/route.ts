import type { NextRequest } from "next/server";
import { z } from "zod";
import "@/lib/adapters/bootstrap";
import { getSignalSource, listSignalSources } from "@/lib/adapters/signal-source";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

// POST /api/signals/detect - run a signal source's detectSignals for a Capsule and
// return the CANDIDATE moments (not persisted). The "curator, not author" surface:
// the operator reviews these and flags the good ones via POST /api/signals. Admin-gated.
//
// Defaults to the Farcaster source (dark until NEYNAR_API_KEY is set - returns []).
const detectSchema = z.object({
  capsule_id: z.string().uuid(),
  source: z.string().min(1).max(40).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = detectSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const sourceId = parsed.data.source ?? "farcaster";
    const source = getSignalSource(sourceId);
    if (!source) {
      const available = listSignalSources().map((s) => s.id);
      return badRequest(
        `unknown signal source "${sourceId}" (available: ${available.join(", ")})`,
      );
    }

    const candidates = await source.detectSignals(parsed.data.capsule_id);
    return ok({ source: sourceId, count: candidates.length, candidates });
  } catch (err) {
    return serverError(err, "signals.detect.POST");
  }
}

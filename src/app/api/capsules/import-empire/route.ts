import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { importEmpireAsHearth } from "@/lib/empire/import";

// POST /api/capsules/import-empire - bring an existing Empire Builder empire in AS a
// Spark. Given an empire id (base_token 0x..., fid<n>, or slug like zabalgamez01e9af),
// pulls its identity from Empire Builder and creates a Hearth wired to it (idempotent).
// Admin-gated. This is the "bring already-created things into the fold" entry point.
const importEmpireSchema = z.object({
  empire_id: z.string().min(2).max(120),
});

export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = importEmpireSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    // Empire is an external upstream; surface its real error to the operator.
    try {
      const hearth = await importEmpireAsHearth(parsed.data.empire_id.trim());
      return ok(hearth, 201);
    } catch (empireErr) {
      const msg = empireErr instanceof Error ? empireErr.message : "import failed";
      console.error("[sparkz:import-empire] upstream:", msg);
      return badRequest(msg);
    }
  } catch (err) {
    return serverError(err, "hearths.importEmpire.POST");
  }
}

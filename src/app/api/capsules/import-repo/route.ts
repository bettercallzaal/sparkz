import type { NextRequest } from "next/server";
import { importRepoSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { parseRepoRef } from "@/lib/brand-audit/github";
import { importRepoAsCapsule } from "@/lib/brand-audit/import";

// POST /api/capsules/import-repo - import (or re-scan) a GitHub repo as an `oss`
// Capsule candidate. The brand-audit entry point: repo + contributors land in
// metadata; the audit verdicts are set separately via /api/audit.
export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = importRepoSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const ref = parseRepoRef(parsed.data.ref);
    if (!ref) return badRequest("ref must be 'owner/repo' or a github.com URL");

    // GitHub is an external upstream; surface its real error to the operator
    // (rate limit, 404, empty repo) instead of a generic 500 - this is a gated
    // operator tool. Set GITHUB_TOKEN to raise the unauthenticated rate limit.
    try {
      const capsule = await importRepoAsCapsule(ref.owner, ref.repo);
      return ok(capsule, 201);
    } catch (ghErr) {
      const msg = ghErr instanceof Error ? ghErr.message : "import failed";
      console.error("[sparkz:import-repo] upstream:", msg);
      return badRequest(msg);
    }
  } catch (err) {
    return serverError(err, "capsules.importRepo.POST");
  }
}

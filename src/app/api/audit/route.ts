import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { auditGateSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import type { Capsule } from "@/lib/supabase/types";
import { emptyAudit, type OssCapsuleMetadata } from "@/lib/brand-audit/types";

// POST /api/audit - set the Spark-readiness gate verdicts / security-reviewed /
// notes on an `oss` Capsule. Merges into metadata.audit_result; stamps audited_at.
export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = auditGateSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const input = parsed.data;

    const supabase = getServiceClient();
    const { data: capsule, error: capErr } = await supabase
      .from("capsules")
      .select("*")
      .eq("id", input.capsule_id)
      .maybeSingle();
    if (capErr) throw capErr;
    if (!capsule) return badRequest("capsule not found");
    if ((capsule as Capsule).type !== "oss") {
      return badRequest("audit applies to oss Capsules only");
    }

    const meta = (capsule as Capsule).metadata as OssCapsuleMetadata;
    const prior = meta.audit_result ?? emptyAudit();
    const audit_result = {
      ...prior,
      gates: { ...prior.gates, ...(input.gates ?? {}) },
      security_reviewed: input.security_reviewed ?? prior.security_reviewed,
      notes: input.notes ?? prior.notes,
      audited_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("capsules")
      .update({ metadata: { ...meta, audit_result } })
      .eq("id", input.capsule_id)
      .select("*")
      .single();
    if (error) throw error;
    return ok(data as Capsule);
  } catch (err) {
    return serverError(err, "audit.POST");
  }
}

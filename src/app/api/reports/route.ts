import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { badRequest, ok, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { sessionClaims } from "@/lib/session";
import { viewerIdentity } from "@/lib/moderation";
import { reportSchema, reviewReportSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

// Reports on user content (migration 0009; App Store guideline 1.2; Zaal D2 and D4).
//   POST  /api/reports  signed in: report a Hearth or a Spark (spam, abuse, ip, other).
//                       One report per person per thing; a repeat answers deduped.
//   GET   /api/reports  admin: open reports, newest first, for /admin/pending.
//   PATCH /api/reports  admin: mark a report reviewed or dismissed.
// Reports stay inside Sparkz: nothing is sent to anyone (D4).
const SIGN_IN_TO_REPORT = "Sign in to report";
const LIST_LIMIT = 100;

export async function POST(req: NextRequest) {
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    const reporter = viewerIdentity(sessionClaims(req));
    if (!reporter) return NextResponse.json({ ok: false, error: SIGN_IN_TO_REPORT }, { status: 401 });

    const body = await req.json().catch(() => null);
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const { target_type, target_id, reason, note } = parsed.data;

    const supabase = getServiceClient();
    let hearthId: string | null = null;
    if (target_type === "hearth") {
      const { data, error } = await supabase.from("hearths").select("id").eq("id", target_id).maybeSingle();
      if (error) throw error;
      hearthId = (data as { id: string } | null)?.id ?? null;
    } else {
      const { data, error } = await supabase.from("sparks").select("hearth_id").eq("id", target_id).maybeSingle();
      if (error) throw error;
      hearthId = (data as { hearth_id: string } | null)?.hearth_id ?? null;
    }
    if (!hearthId) return badRequest(`No ${target_type} with that id.`);

    const { error } = await supabase.from("content_reports").insert({
      reporter_id: reporter,
      target_type,
      target_id,
      hearth_id: hearthId,
      reason,
      note: note ? note : null,
    });
    // The unique (reporter_id, target_type, target_id) index: this person already reported it.
    if (error?.code === "23505") return ok({ reported: true, deduped: true });
    if (error) throw error;
    return ok({ reported: true }, 201);
  } catch (err) {
    return serverError(err, "reports.POST");
  }
}

export async function GET(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("content_reports")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT);
    // Fail closed: a failed read must never show as "no reports".
    if (error) throw error;
    return ok(data ?? []);
  } catch (err) {
    return serverError(err, "reports.GET");
  }
}

export async function PATCH(req: NextRequest) {
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = reviewReportSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("content_reports")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id)
      .select("id, status")
      .maybeSingle();
    if (error) throw error;
    if (!data) return badRequest("No report with that id.");
    return ok(data);
  } catch (err) {
    return serverError(err, "reports.PATCH");
  }
}

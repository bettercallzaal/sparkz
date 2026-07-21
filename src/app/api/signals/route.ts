import type { NextRequest } from "next/server";
import "@/lib/adapters/bootstrap";
import { getServiceClient } from "@/lib/supabase/server";
import { flagSignalSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { generateDrafts } from "@/lib/meme-engine/draft";
import { routeApproval } from "@/lib/adapters/approval-channel";
import type { Capsule, Signal, SignalDraft } from "@/lib/supabase/types";

// GET /api/signals?capsule_id=... - signals for a capsule (with their drafts).
export async function GET(req: NextRequest) {
  try {
    const capsuleId = req.nextUrl.searchParams.get("capsule_id");
    if (!capsuleId) return badRequest("capsule_id is required");

    const supabase = getServiceClient();
    const { data: signals, error } = await supabase
      .from("signals")
      .select("*")
      .eq("capsule_id", capsuleId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const ids = (signals as Signal[]).map((s) => s.id);
    let drafts: SignalDraft[] = [];
    if (ids.length) {
      const { data: d, error: dErr } = await supabase
        .from("signal_drafts")
        .select("*")
        .in("signal_id", ids)
        .order("rank", { ascending: true });
      if (dErr) throw dErr;
      drafts = d as SignalDraft[];
    }

    const withDrafts = (signals as Signal[]).map((s) => ({
      ...s,
      drafts: drafts.filter((d) => d.signal_id === s.id),
    }));
    return ok(withDrafts);
  } catch (err) {
    return serverError(err, "signals.GET");
  }
}

// POST /api/signals - flag a moment, then run the Meme Engine: 3 Capsule-grounded
// drafts -> persist -> notify approval channels. The whole flag->3-drafts step.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = flagSignalSchema.safeParse(body);
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

    // 1. Persist the flagged signal (the human "detection event").
    const { data: signalRow, error: sigErr } = await supabase
      .from("signals")
      .insert({
        capsule_id: input.capsule_id,
        source: input.source ?? "human",
        source_meta: input.source_meta ?? {},
        text: input.text,
        why_it_matched: input.why_it_matched ?? null,
        status: "flagged",
        flagged_by: input.flagged_by ?? null,
      })
      .select("*")
      .single();
    if (sigErr) throw sigErr;
    const signal = signalRow as Signal;

    // 2. Draft 3 Capsule-grounded responses (cheap tier / fallback).
    const generated = await generateDrafts(capsule as Capsule, signal);
    const { data: draftRows, error: draftErr } = await supabase
      .from("signal_drafts")
      .insert(
        generated.map((g) => ({
          signal_id: signal.id,
          capsule_id: signal.capsule_id,
          model: g.model,
          prompt_version: g.promptVersion,
          draft_text: g.text,
          rank: g.rank,
        })),
      )
      .select("*");
    if (draftErr) throw draftErr;
    const drafts = draftRows as SignalDraft[];

    // 3. Move to drafted + notify approval channels (redundant fan-out).
    await supabase
      .from("signals")
      .update({ status: "drafted" })
      .eq("id", signal.id);

    const origin = req.nextUrl.origin;
    const routing = await routeApproval({
      signalId: signal.id,
      capsuleId: signal.capsule_id,
      capsuleName: (capsule as Capsule).name,
      signalText: signal.text,
      drafts: drafts.map((d) => ({ id: d.id, rank: d.rank, text: d.draft_text })),
      approveUrl: `${origin}/admin?capsule=${signal.capsule_id}&signal=${signal.id}`,
    });

    return ok(
      { signal: { ...signal, status: "drafted" }, drafts, routing },
      201,
    );
  } catch (err) {
    return serverError(err, "signals.POST");
  }
}

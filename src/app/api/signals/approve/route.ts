import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { approveDraftSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import type { MemeReceipt, Signal, SignalDraft } from "@/lib/supabase/types";

// POST /api/signals/approve - human picks one draft. Marks it chosen, moves the
// signal to published, and writes THE Meme Receipt (receipt-on-approval). The two
// rejected drafts keep their moat value via signal_drafts.reject_reason.
// Idempotent: if the signal is already published, return the existing receipt
// (first-approve-wins across the redundant approval channels).
export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = approveDraftSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const input = parsed.data;

    const supabase = getServiceClient();

    const { data: signalRow, error: sigErr } = await supabase
      .from("signals")
      .select("*")
      .eq("id", input.signal_id)
      .maybeSingle();
    if (sigErr) throw sigErr;
    if (!signalRow) return badRequest("signal not found");
    const signal = signalRow as Signal;

    // Idempotency: already published -> return the existing receipt, no-op.
    if (signal.status === "published") {
      const { data: existing } = await supabase
        .from("meme_receipts")
        .select("*")
        .eq("signal_id", signal.id)
        .maybeSingle();
      return ok({ signal, receipt: existing, alreadyApproved: true });
    }

    const { data: draftRow, error: draftErr } = await supabase
      .from("signal_drafts")
      .select("*")
      .eq("id", input.draft_id)
      .maybeSingle();
    if (draftErr) throw draftErr;
    if (!draftRow || (draftRow as SignalDraft).signal_id !== signal.id) {
      return badRequest("draft does not belong to this signal");
    }
    const chosen = draftRow as SignalDraft;

    const now = new Date().toISOString();

    // Mark the chosen draft; stamp the rejected ones with a reject_reason so the
    // "what the human passed on" signal is captured (the moat).
    await supabase
      .from("signal_drafts")
      .update({ chosen: true, approver: input.approver ?? null })
      .eq("id", chosen.id);
    await supabase
      .from("signal_drafts")
      .update({ reject_reason: "not chosen by approver" })
      .eq("signal_id", signal.id)
      .neq("id", chosen.id);

    // Advance the signal to published.
    await supabase
      .from("signals")
      .update({
        status: "published",
        approver: input.approver ?? null,
        approved_via: input.approved_via ?? "in_app",
        approved_at: now,
      })
      .eq("id", signal.id);

    // Write the Meme Receipt.
    const { data: receiptRow, error: recErr } = await supabase
      .from("meme_receipts")
      .insert({
        capsule_id: signal.capsule_id,
        signal_id: signal.id,
        chosen_draft_id: chosen.id,
        why_it_matched: signal.why_it_matched,
        creator: chosen.model, // the drafting model authored the response
        approver: input.approver ?? null,
        source_assets: [],
        lessons: input.lessons ?? null,
        published_at: now,
      })
      .select("*")
      .single();
    if (recErr) throw recErr;

    return ok(
      {
        signal: { ...signal, status: "published" },
        receipt: receiptRow as MemeReceipt,
      },
      201,
    );
  } catch (err) {
    return serverError(err, "signals.approve.POST");
  }
}

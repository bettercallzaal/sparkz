import { getServiceClient } from "@/lib/supabase/server";
import type { Signal } from "@/lib/supabase/types";
import {
  type CulturalSignal,
  type SignalSource,
  registerSignalSource,
} from "./index";

// v1 SignalSource = a human (or ZOL) flags a cultural moment. The "detection
// event" is a human submission, persisted as a flagged signal. detectSignals
// returns the human-flagged signals that have not been drafted yet - the same
// contract Alpha Radar will implement later by polling an external feed.

export class HumanSignalSource implements SignalSource {
  readonly id = "human";

  async detectSignals(capsuleId: string): Promise<CulturalSignal[]> {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("signals")
      .select("*")
      .eq("capsule_id", capsuleId)
      .eq("source", this.id)
      .eq("status", "flagged");
    if (error) throw error;

    return (data as Signal[]).map((s) => ({
      capsuleId: s.capsule_id,
      text: s.text,
      whyItMatched: s.why_it_matched ?? undefined,
      source: s.source,
      sourceMeta: s.source_meta,
      flaggedBy: s.flagged_by ?? undefined,
    }));
  }
}

registerSignalSource(new HumanSignalSource());

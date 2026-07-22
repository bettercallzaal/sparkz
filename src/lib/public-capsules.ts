import { getServiceClient } from "@/lib/supabase/server";
import type { Capsule } from "@/lib/supabase/types";

// Shared public read of Capsules for the landing surfaces. Server-side, never
// throws (a missing/unreachable DB just renders an empty ecosystem).
export async function loadPublicCapsules(): Promise<Capsule[]> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("capsules")
      .select("*")
      // Hide self-serve sparks awaiting review (keep everything with no review flag).
      .or("metadata->>review.is.null,metadata->>review.neq.pending")
      .order("created_at", { ascending: false });
    return (data as Capsule[]) ?? [];
  } catch {
    return [];
  }
}

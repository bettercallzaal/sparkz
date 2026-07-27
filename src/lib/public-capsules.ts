import { getServiceClient } from "@/lib/supabase/server";
import { publicCapsule, PUBLIC_REVIEW_FILTER } from "@/lib/sanitize";
import type { Capsule } from "@/lib/supabase/types";

// Shared public read of Capsules for the landing surfaces. Server-side, never
// throws (a missing/unreachable DB just renders an empty ecosystem).
export async function loadPublicCapsules(): Promise<Capsule[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("capsules")
      .select("*")
      // Only unreviewed (operator-made) + approved sparks; strip PII defensively.
      .or(PUBLIC_REVIEW_FILTER)
      .order("created_at", { ascending: false });
    // A query error leaves data null WITHOUT throwing, so the catch below never
    // fires - the landing surfaces would silently render an empty ecosystem and
    // hide a real DB outage. Log it (reusing the [sparkz:*] convention from
    // lib/http.ts) while still degrading gracefully to [].
    if (error) console.error("[sparkz:public-capsules]", error);
    return ((data as Capsule[]) ?? []).map(publicCapsule);
  } catch {
    return [];
  }
}

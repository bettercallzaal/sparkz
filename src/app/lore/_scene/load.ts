import { loadPublicHearths } from "@/lib/public-hearths";
import type { SceneSpark } from "./HearthScene";

// Real data only: the public Hearth names the app already loads for the home page.
// Empty when the database is unreachable, and the scene then shows the Hearth alone.
export async function loadScene(): Promise<{ sparks: SceneSpark[]; total: number }> {
  const hearths = await loadPublicHearths();
  return {
    sparks: hearths.map((h) => ({ slug: h.slug, name: h.name })),
    total: hearths.length,
  };
}

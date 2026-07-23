import type { MetadataRoute } from "next";
import { loadPublicCapsules } from "@/lib/public-capsules";

const BASE = "https://trysparkz.com";

// Dynamic sitemap: the static marketing/product routes + every public Capsule.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/explore", "/start", "/demo", "/blog", "/architecture"].map(
    (p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }),
  );

  let capsules: MetadataRoute.Sitemap = [];
  try {
    capsules = (await loadPublicCapsules()).map((c) => ({
      url: `${BASE}/c/${c.slug}`,
      lastModified: c.updated_at,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch {
    // sitemap should never break the build
  }

  return [...staticRoutes, ...capsules];
}

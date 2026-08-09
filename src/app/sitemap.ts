import type { MetadataRoute } from "next";
import { loadPublicHearths } from "@/lib/public-hearths";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();

// Dynamic sitemap: the static marketing/product routes + every public Hearth.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "", "/explore", "/start", "/demo", "/blog", "/architecture",
    // Content pages (consolidated from the ZOL page set).
    "/manifesto", "/hearth", "/meme-engine", "/graduation",
    "/examples", "/contribution", "/split-wizard", "/community-pool",
    "/zao", "/farcaster", "/audius",
  ].map(
    (p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }),
  );

  let hearths: MetadataRoute.Sitemap = [];
  try {
    hearths = (await loadPublicHearths()).map((c) => ({
      url: `${BASE}/c/${c.slug}`,
      lastModified: c.updated_at,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch {
    // sitemap should never break the build
  }

  return [...staticRoutes, ...hearths];
}

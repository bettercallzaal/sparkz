import type { MetadataRoute } from "next";
import { canonicalOrigin } from "@/lib/origin";

export default function robots(): MetadataRoute.Robots {
  const origin = canonicalOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Operator + auth surfaces have no public value for crawlers.
      disallow: ["/admin", "/profile", "/api/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

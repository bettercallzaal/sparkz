import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Operator + auth surfaces have no public value for crawlers.
      disallow: ["/admin", "/profile", "/api/"],
    },
    sitemap: "https://trysparkz.com/sitemap.xml",
    host: "https://trysparkz.com",
  };
}

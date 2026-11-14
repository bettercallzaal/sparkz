// One answer to "what picture does this Hearth show", used by every avatar on the site.
// Zaal, 14 Nov 2026: "no logos show up i want that in asap". Before this, only the Hearth
// page passed a picture, and it read metadata.image alone, which no live Hearth had set.
//
// Order: a picture the owner uploaded (metadata.image), then a token logo brought in from
// Empire (metadata.logo_uri, set on ZABAL and ZABAL Gamez), then a logo bundled in this
// repo for the ZAO Hearths (public/hearths), then none (Avatar draws the initial).

// Logos copied from the ZAO's own repos (coc-concertz, zaostock, zaoweb) into public/.
export const BUILT_IN_LOGOS: Readonly<Record<string, string>> = {
  "coc-concertz": "/hearths/coc-concertz.jpeg",
  "zao-festivals": "/hearths/zao-festivals.png",
  "zao-devz": "/hearths/zao-devz.png",
  sparkz: "/brand/sparkz-logo.png",
};

// Only a web address or a path on this site counts; anything else (javascript:, data:,
// a typo) is ignored rather than put in an img src.
function usable(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s.startsWith("https://") || s.startsWith("http://")) return s;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return null;
}

export function hearthLogo(h: { slug: string; metadata?: unknown }): string | null {
  const m = (h.metadata && typeof h.metadata === "object" ? h.metadata : {}) as Record<string, unknown>;
  return usable(m.image) ?? usable(m.logo_uri) ?? BUILT_IN_LOGOS[h.slug] ?? null;
}

// The Hearths the Home page puts first. Zaal chose these on 14 Nov 2026 for the design
// pass ("making it visible our goals and what i wanna showcase"). Order here is the order
// on the page. Pure, so it is unit-tested.
export const SHOWCASE_SLUGS = ["zao-festivals", "coc-concertz", "zabal", "zabal-gamez"] as const;

// Splits the public Hearths into the featured ones, in SHOWCASE_SLUGS order, and how many
// others there are. A slug that is missing (not public, or not seeded) is skipped, so the
// page never shows an empty card.
export function pickShowcase<T extends { slug: string }>(
  hearths: T[],
  slugs: readonly string[] = SHOWCASE_SLUGS,
): { featured: T[]; others: number } {
  const bySlug = new Map(hearths.map((h) => [h.slug, h]));
  const featured = slugs.flatMap((s) => {
    const h = bySlug.get(s);
    return h ? [h] : [];
  });
  return { featured, others: hearths.length - featured.length };
}

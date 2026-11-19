// A link a person or the admin stored on a Hearth (metadata.links.*) becomes an href
// only when it is an https URL. Owner edits are checked on the way in (schemas.ts
// httpsUrl), but the admin create route takes metadata as-is, so the page checks again
// at render: a stored javascript: or data: link renders as no link at all.
export function httpsHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  try {
    return new URL(v).protocol === "https:" ? v : null;
  } catch {
    return null;
  }
}

// For links inside committed markdown: https, http, a site path or an in-page anchor.
export function articleHref(value: string): string | null {
  const v = value.trim();
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (v.startsWith("#")) return v;
  try {
    const p = new URL(v).protocol;
    return p === "https:" || p === "http:" ? v : null;
  } catch {
    return null;
  }
}

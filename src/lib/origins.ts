// Two-domain split.
//
// - trysparkz.com  (SEO_ORIGIN): the SEO/GEO marketing front door. Fast, indexed,
//   canonical for marketing pages (homepage, how-it-works, blog, architecture). Its job
//   is to get people in the door. It does NOT host sign-in.
// - sparkz.lol     (APP_ORIGIN): where the app actually lives - explore, create,
//   Capsules, profile, and Sign-In-With-Farcaster. App pages are canonical here.
//
// Rule of thumb: any link that ENTERS the interactive app uses appUrl() so it lands on
// sparkz.lol no matter which domain rendered it. Marketing/content links stay relative
// so they remain on whichever domain the visitor is already on.
//
// Not moved yet (signature-gated): the Farcaster Mini App manifest + accountAssociation
// live on SEO_ORIGIN. Until a new manifest is signed for sparkz.lol, Capsule Mini App
// launches keep pointing at SEO_ORIGIN. See the domain-split PR follow-ups.

export const SEO_ORIGIN = "https://trysparkz.com";
export const APP_ORIGIN = "https://sparkz.lol";
export const APP_DOMAIN = "sparkz.lol";

/** Absolute URL into the app (sparkz.lol). Use for every app-entry link/CTA. */
export function appUrl(path = "/"): string {
  return `${APP_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

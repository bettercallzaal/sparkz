// Options and target check for scripts/copy-supabase-to-neon.mjs, kept apart so they are
// unit-tested (src/lib/db/copy-options.test.ts).

/** Dry run unless --apply is given. --dry-run is accepted and wins over --apply. */
export function parseCopyArgs(argv) {
  const apply = argv.includes("--apply") && !argv.includes("--dry-run");
  return { apply, withImages: argv.includes("--with-images") };
}

/**
 * The Neon URL the copy writes to, first match wins. Vercel's Neon integration names its
 * variables DATABASE_URL_UNPOOLED and DATABASE_URL when no prefix is set (what the sparkz
 * project has, 14 Nov 2026), or STORAGE_DATABASE_URL_UNPOOLED and so on with the STORAGE
 * prefix. Unpooled first: a long copy is a plain sequence of statements.
 */
export const COPY_TARGET_VARS = [
  "SPARKZ_DATABASE_URL",
  "STORAGE_DATABASE_URL_UNPOOLED",
  "STORAGE_DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "DATABASE_URL",
];

export function copyTargetUrl(env) {
  for (const name of COPY_TARGET_VARS) {
    if (env[name]) return env[name];
  }
  return undefined;
}

/**
 * Whether the Vercel Blob SDK (2.8.2) has credentials for --with-images. Its own error text
 * names the two forms it accepts: BLOB_READ_WRITE_TOKEN, or an OIDC token (VERCEL_OIDC_TOKEN)
 * together with BLOB_STORE_ID. sparkz-blob is connected to the project over OIDC (14 Nov
 * 2026: BLOB_STORE_ID, no read-write token), and `vercel env pull` writes a short-lived
 * VERCEL_OIDC_TOKEN next to it, so a freshly pulled .env.copy is enough.
 */
export function blobAuth(env) {
  if (env.BLOB_READ_WRITE_TOKEN) return "token";
  if (env.VERCEL_OIDC_TOKEN && env.BLOB_STORE_ID) return "oidc";
  return null;
}

/**
 * The copy may only write to a Neon database. Returns the host when the URL points at Neon
 * (*.neon.tech), otherwise null, so a Supabase or other URL set by mistake is refused.
 */
export function neonHost(url) {
  if (!url) return null;
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  return host === "neon.tech" || host.endsWith(".neon.tech") ? host : null;
}

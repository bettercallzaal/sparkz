// Options and target check for scripts/copy-supabase-to-neon.mjs, kept apart so they are
// unit-tested (src/lib/db/copy-options.test.ts).

/** Dry run unless --apply is given. --dry-run is accepted and wins over --apply. */
export function parseCopyArgs(argv) {
  const apply = argv.includes("--apply") && !argv.includes("--dry-run");
  return { apply, withImages: argv.includes("--with-images") };
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

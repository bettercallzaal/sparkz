// Seed The ZAO's Sparks: ZAO DEVZ, IMan Afrikah and ZABAL (Zaal, 30 Oct 2026),
// plus CoC ConcertZ and ZAO Festivals (Zaal, 3 Nov 2026; the fractal stays off Sparkz for now, his call the same night).
// Run: npm run seed:zao  (loads .env.local via node --env-file)
//      node scripts/seed-zao-projects.mjs --dry-run   prints every row it would write,
//      and needs no keys, no network and no installed packages.
// Safe to re-run: a slug that already exists is left untouched, never overwritten. The one
// exception is the owner backfill below, which only fills an owner_fid that is NULL.
//
// Owners (12 Nov 2026): Zaal is signed in on FID 19640 and owned none of the ZAO Hearths, so
// his Home was empty and no owner tools showed. Each seeded Hearth now gets an owner, and the
// four Hearths already live get Zaal as owner where none is set.

const DRY_RUN = process.argv.includes("--dry-run");
const ZAAL_FID = 19640; // lib/admin-identities.ts
const IMAN_FID = 1057869; // lib/alpha-access.ts

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DRY_RUN && (!url || !key)) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Fill .env.local first.",
  );
  process.exit(1);
}

const supabase = DRY_RUN
  ? null
  : (await import("@supabase/supabase-js")).createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

// All of them start as sparks: no token until the backing is real. The Empire rail is the
// graduation path (Clanker via Empire Builder), held in config, nothing on-chain yet.
const projects = [
  {
    slug: "zao-devz",
    owner_fid: ZAAL_FID,
    type: "oss",
    name: "ZAO DEVZ",
    bio: "The builders of The ZAO. Open-source tools for artists: ZAO MixZ, the ZAO bots, ZAOresearch and more.",
    status: "spark",
    economic_config: { tokenization_rail: "clanker", graduated: false },
    metadata: { entry_point: "oss", zao: true },
  },
  {
    slug: "iman-afrikah",
    owner_fid: IMAN_FID,
    type: "creator",
    name: "IMan Afrikah",
    bio: "Zambian artist and DJ in The ZAO. WaveWarZ, SongChainn and ZAO Music. Back the music first, the coin comes later.",
    status: "spark",
    economic_config: { tokenization_rail: "clanker", launch_via: "empire-builder", graduated: false },
    metadata: { entry_point: "creator", zao: true },
  },
  {
    slug: "zabal",
    owner_fid: ZAAL_FID,
    type: "culture",
    name: "ZABAL",
    bio: "The ZAO's culture coin community. Boost ZABAL casts, climb the leaderboard, share the community pool.",
    status: "spark",
    economic_config: { tokenization_rail: "clanker", graduated: false },
    metadata: { entry_point: "culture", zao: true },
  },
  {
    slug: "coc-concertz",
    owner_fid: ZAAL_FID,
    type: "culture",
    name: "CoC ConcertZ",
    bio: "The ZAO's concert series. Live shows and surprise sets. Back the next show before the lineup drops.",
    status: "spark",
    economic_config: { tokenization_rail: "clanker", launch_via: "empire-builder", graduated: false },
    metadata: { entry_point: "culture", zao: true },
  },
  {
    slug: "zao-festivals",
    owner_fid: ZAAL_FID,
    type: "culture",
    name: "ZAO Festivals",
    bio: "ZAOstock and every festival The ZAO throws, on site and online. Back the festival, not a coin.",
    status: "spark",
    economic_config: { tokenization_rail: "clanker", launch_via: "empire-builder", graduated: false },
    metadata: { entry_point: "culture", zao: true },
  },
];

// Hearths already live whose owner_fid is NULL (read from /api/capsules, 12 Nov 2026):
// Zaal becomes the owner. A Hearth that already has an owner is never changed.
const ownerBackfill = [
  { slug: "zabal", owner_fid: ZAAL_FID },
  { slug: "zabal-gamez", owner_fid: ZAAL_FID },
  { slug: "coc-concertz", owner_fid: ZAAL_FID },
  { slug: "sparkz", owner_fid: ZAAL_FID },
];

if (DRY_RUN) {
  console.log("DRY RUN: nothing is written. Inserts, only for a slug that does not exist yet:");
  for (const p of projects) console.log(`  insert hearths ${JSON.stringify(p)}`);
  console.log("Owner backfill, only where owner_fid IS NULL:");
  for (const b of ownerBackfill) {
    console.log(`  update hearths set owner_fid = ${b.owner_fid} where slug = '${b.slug}' and owner_fid is null`);
  }
  process.exit(0);
}

for (const p of projects) {
  const { data: existing, error: readError } = await supabase
    .from("hearths")
    .select("id, slug")
    .eq("slug", p.slug)
    .maybeSingle();
  if (readError) {
    console.error(`Could not check ${p.slug}:`, readError.message);
    process.exitCode = 1;
    continue;
  }
  if (existing) {
    console.log(`Kept ${p.slug}: already exists (${existing.id})`);
    continue;
  }
  const { data, error } = await supabase.from("hearths").insert(p).select("id, slug").single();
  if (error) {
    console.error(`Seed failed for ${p.slug}:`, error.message);
    process.exitCode = 1;
    continue;
  }
  console.log(`Seeded ${data.slug}: ${data.id}`);
}

for (const b of ownerBackfill) {
  const { data, error } = await supabase
    .from("hearths")
    .update({ owner_fid: b.owner_fid })
    .eq("slug", b.slug)
    .is("owner_fid", null)
    .select("slug");
  if (error) {
    console.error(`Owner backfill failed for ${b.slug}:`, error.message);
    process.exitCode = 1;
    continue;
  }
  console.log(
    data && data.length > 0
      ? `Owner set on ${b.slug}: fid ${b.owner_fid}`
      : `Kept ${b.slug}: missing, or it already has an owner`,
  );
}

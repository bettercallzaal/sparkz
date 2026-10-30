// Seed The ZAO's first three Sparks: ZAO DEVZ, IMan Afrikah and ZABAL (Zaal, 30 Oct 2026).
// Run: npm run seed:zao  (loads .env.local via node --env-file)
// Safe to re-run: a slug that already exists is left untouched, never overwritten.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Fill .env.local first.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// All three start as sparks: no token until the backing is real. The Empire rail is the
// graduation path (Clanker via Empire Builder), held in config, nothing on-chain yet.
const projects = [
  {
    slug: "zao-devz",
    type: "oss",
    name: "ZAO DEVZ",
    bio: "The builders of The ZAO. Open-source tools for artists: ZAO MixZ, the ZAO bots, ZAOresearch and more.",
    status: "spark",
    economic_config: { tokenization_rail: "clanker", graduated: false },
    metadata: { entry_point: "oss", zao: true },
  },
  {
    slug: "iman-afrikah",
    type: "creator",
    name: "IMan Afrikah",
    bio: "Zambian artist and DJ in The ZAO. WaveWarZ, SongChainn and ZAO Music. Back the music first, the coin comes later.",
    status: "spark",
    economic_config: { tokenization_rail: "clanker", launch_via: "empire-builder", graduated: false },
    metadata: { entry_point: "creator", zao: true },
  },
  {
    slug: "zabal",
    type: "culture",
    name: "ZABAL",
    bio: "The ZAO's culture coin community. Boost ZABAL casts, climb the leaderboard, share the community pool.",
    status: "spark",
    economic_config: { tokenization_rail: "clanker", graduated: false },
    metadata: { entry_point: "culture", zao: true },
  },
];

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

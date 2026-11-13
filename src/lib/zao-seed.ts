// The ZAO's Hearths and who owns them. Same rows as scripts/seed-zao-projects.mjs
// (Zaal, 30 Oct and 3 Nov 2026; owners 12 Nov 2026). The script runs from the Database
// workflow; this list runs from the admin button on Me (/api/admin/seed-zao), through
// the app's own server access, so Zaal can set Sparkz up by tapping. Keep the two in
// step until the script imports this file.

const ZAAL_FID = 19640; // lib/admin-identities.ts ADMIN_FIDS
const IMAN_FID = 1057869; // lib/alpha-access.ts ALPHA_FIDS

export interface SeedHearth {
  slug: string;
  owner_fid: number;
  type: "creator" | "culture" | "oss";
  name: string;
  bio: string;
  status: "spark";
  economic_config: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export const ZAO_HEARTHS: SeedHearth[] = [
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

// Live Hearths that had no owner on 12 Nov 2026 (read from /api/capsules). Filled only
// where owner_fid IS NULL; an existing owner is never changed.
export const OWNER_BACKFILL: { slug: string; owner_fid: number }[] = [
  { slug: "zabal", owner_fid: ZAAL_FID },
  { slug: "zabal-gamez", owner_fid: ZAAL_FID },
  { slug: "coc-concertz", owner_fid: ZAAL_FID },
  { slug: "sparkz", owner_fid: ZAAL_FID },
];

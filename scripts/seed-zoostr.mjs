// Seed the Zoostr Creator Capsule - v1's proving-ground Capsule.
// Run: npm run seed:zoostr  (loads .env.local via node --env-file)
// Idempotent: upserts on slug.

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

const zoostr = {
  slug: "zoostr",
  type: "creator",
  name: "Zoostr",
  bio: "The first Sparkz Creator Capsule. Back the work, collect what it makes - a token only if and when it makes sense.",
  status: "spark",
  // 1/1/98 creator-first economics + 0xSplits distribution wallet, only if/when a
  // token launches on the Clanker rail. Held in config, not on-chain yet.
  economic_config: {
    model: "1/1/98",
    split_contract: null,
    tokenization_rail: "clanker",
    graduated: false,
  },
  metadata: {
    entry_point: "creator",
    fef: true,
  },
};

const { data, error } = await supabase
  .from("capsules")
  .upsert(zoostr, { onConflict: "slug" })
  .select("*")
  .single();

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log("Seeded Zoostr Capsule:", data.id, `(${data.slug}, ${data.type})`);

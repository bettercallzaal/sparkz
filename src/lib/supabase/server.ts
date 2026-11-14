import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createQueryClient } from "@/lib/db/query";
import { neonExec, neonUrl } from "@/lib/db/neon";

// Server-only database client. NEVER import this into a client component: it holds the
// service credentials. All DB access in Sparkz goes through the server, so this is the
// one door in.
//
// Two backends while Sparkz moves off Supabase (Zaal, 14 Nov 2026):
//   SPARKZ_DB=neon -> Neon Postgres (Vercel Storage, STORAGE_DATABASE_URL) through the
//                     small query builder in lib/db/query.ts, which answers the same calls.
//   unset          -> Supabase, exactly as before.
// The switch is an explicit flag, not "a Neon URL exists": Vercel's Neon integration puts
// STORAGE_DATABASE_URL into Production as soon as it is connected, and the live site must
// not move to an empty database before the data is copied.

export function dbBackend(): "neon" | "supabase" {
  return process.env.SPARKZ_DB === "neon" ? "neon" : "supabase";
}

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  if (dbBackend() === "neon") {
    const url = neonUrl();
    if (!url) throw new Error("Neon env missing: SPARKZ_DB=neon needs STORAGE_DATABASE_URL (Vercel Storage > sparkz-db)");
    // The builder implements the subset of the supabase-js surface Sparkz uses; typing it
    // as SupabaseClient keeps every call site unchanged. Unsupported calls throw.
    cached = createQueryClient(neonExec(url)) as unknown as SupabaseClient;
    return cached;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

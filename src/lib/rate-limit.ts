import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

// Client IP, hashed so we never store raw addresses. Salted with a server-only
// secret so the hash cannot be reversed by guessing IPs.
export function clientIpHash(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip =
    xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const salt = process.env.SPARKZ_ADMIN_TOKEN ?? "sparkz-rate-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

// How many self-serve capsules this ip_hash created inside the window. Durable -
// it uses the Postgres we already run, no KV/Redis to provision. IP rotation can
// bypass it, so pair it with a review gate for real abuse defense; this stops the
// casual flood.
export async function selfServeCountInWindow(
  ipHash: string,
  windowMs: number,
): Promise<number> {
  const supabase = getServiceClient();
  const since = new Date(Date.now() - windowMs).toISOString();
  const { count } = await supabase
    .from("capsules")
    .select("id", { count: "exact", head: true })
    .filter("metadata->>ip_hash", "eq", ipHash)
    .gte("created_at", since);
  return count ?? 0;
}

export const SELF_SERVE_LIMIT = 3;
export const SELF_SERVE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

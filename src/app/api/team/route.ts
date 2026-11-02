import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { joinTeamSchema } from "@/lib/validation/schemas";
import { badRequest, ok, serverError, tooManyRequests, zodError } from "@/lib/http";
import { clientIpHash } from "@/lib/rate-limit";

// POST /api/team - "Join the team" on a Spark. Public, insert-only, like /api/waitlist:
// anyone can put their name and wallet on a Spark's team list. A wallet that is already
// on that list resolves to a friendly success (no enumeration leak). Reads stay
// operator-only. Capped per IP so a script cannot flood the table.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = joinTeamSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { data: hearth, error: hearthError } = await supabase
      .from("hearths")
      .select("id")
      .eq("slug", parsed.data.slug)
      .maybeSingle();
    if (hearthError) throw hearthError;
    if (!hearth) return badRequest("No Spark with that slug.");

    const ipHash = clientIpHash(req);
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
      .from("team_signups")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    // Fail closed: a failed count must never read as 0.
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_PER_WINDOW) {
      return tooManyRequests("Too many sign-ups from here. Try again in an hour.");
    }

    const { error } = await supabase.from("team_signups").insert({
      hearth_id: (hearth as { id: string }).id,
      name: parsed.data.name,
      wallet: parsed.data.wallet.toLowerCase(),
      handle: parsed.data.handle?.replace(/^@/, "") || null,
      source: "zao",
      ip_hash: ipHash,
    });

    // Unique-violation = that wallet is already on this team; treat as success.
    if (error && error.code !== "23505") throw error;

    return ok({ joined: true }, 201);
  } catch (err) {
    return serverError(err, "team.POST");
  }
}

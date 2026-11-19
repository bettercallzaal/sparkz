import { NextResponse, type NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { joinTeamSchema } from "@/lib/validation/schemas";
import { badRequest, ok, serverError, tooManyRequests, zodError, forbidCrossSite } from "@/lib/http";
import { clientIpHash } from "@/lib/rate-limit";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { sessionClaims } from "@/lib/session";
import { ALPHA_CLOSED_MESSAGE, ALPHA_LOCK } from "@/lib/alpha-access";

// POST /api/team - "Join the team" on a Spark. Public, insert-only, like /api/waitlist:
// anyone can put their name and wallet on a Spark's team list. A wallet that is already
// on that list resolves to a friendly success (no enumeration leak). Reads stay
// operator-only. Capped per IP so a script cannot flood the table.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export async function POST(req: NextRequest) {
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    // Private alpha (lib/alpha-access.ts): this public route is closed to everyone but
    // the listed identities until Sparkz opens.
    if (ALPHA_LOCK && !isAdmin(req) && !sessionClaims(req)) {
      return NextResponse.json({ ok: false, error: ALPHA_CLOSED_MESSAGE }, { status: 403 });
    }

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
      source: parsed.data.source ?? "zao",
      ip_hash: ipHash,
    });

    // Unique-violation = that wallet is already on this team; treat as success.
    if (error && error.code !== "23505") throw error;

    return ok({ joined: true }, 201);
  } catch (err) {
    return serverError(err, "team.POST");
  }
}

// GET /api/team - admin only. The team list and the "apply to the Sparkz team"
// applications, newest first, so an operator can read them without the database.
// ?source=apply narrows to applications. Never returns ip_hash.
const LIST_LIMIT = 200;

export async function GET(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const source = req.nextUrl.searchParams.get("source");
    if (source !== null && source !== "zao" && source !== "apply") {
      return badRequest("source must be zao or apply.");
    }

    const supabase = getServiceClient();
    let query = supabase
      .from("team_signups")
      .select("id, hearth_id, name, wallet, handle, source, created_at")
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT);
    if (source) query = query.eq("source", source);
    const { data, error } = await query;
    // Fail closed: a failed read must never show as an empty list.
    if (error) throw error;

    const rows = (data ?? []) as Array<{
      id: string;
      hearth_id: string;
      name: string;
      wallet: string;
      handle: string | null;
      source: string;
      created_at: string;
    }>;
    const hearthIds = [...new Set(rows.map((r) => r.hearth_id))];
    const slugs = new Map<string, string>();
    if (hearthIds.length > 0) {
      const { data: hearths, error: hearthError } = await supabase
        .from("hearths")
        .select("id, slug")
        .in("id", hearthIds);
      if (hearthError) throw hearthError;
      for (const h of (hearths ?? []) as Array<{ id: string; slug: string }>) slugs.set(h.id, h.slug);
    }

    return ok(
      rows.map(({ hearth_id, ...r }) => ({ ...r, hearth: slugs.get(hearth_id) ?? null })),
    );
  } catch (err) {
    return serverError(err, "team.GET");
  }
}

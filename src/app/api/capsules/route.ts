import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { createHearthSchema } from "@/lib/validation/schemas";
import { ok, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { sessionClaims } from "@/lib/session";
import { blockedOwners } from "@/lib/blocks-server";
import { withoutBlocked } from "@/lib/moderation";
import { publicHearth, PUBLIC_REVIEW_FILTER } from "@/lib/sanitize";
import type { Hearth } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  try {
    const review = new URL(req.url).searchParams.get("review");
    const wantPending = review === "pending";
    // Admin-only views are gated before any database call.
    if (wantPending || review === "all") {
      const denied = requireAdmin(req);
      if (denied) return denied;
    }
    const supabase = getServiceClient();
    let query = supabase
      .from("hearths")
      .select("*")
      .order("created_at", { ascending: false });

    if (review === "all") {
      // Every Hearth for the admin "All Hearths" page: pending, rejected, asleep and
      // ownerless included. Full rows, like the review queue below.
      const { data, error } = await query;
      if (error) throw error;
      return ok(data);
    }

    if (wantPending) {
      // The operator's review queue - admin only. Full rows (incl owner_email).
      const denied = requireAdmin(req);
      if (denied) return denied;
      query = query.filter("metadata->>review", "eq", "pending");
      const { data, error } = await query;
      if (error) throw error;
      return ok(data);
    }

    // Public list: only unreviewed + approved (hides pending AND rejected), without the
    // Hearths of anyone the viewer blocked (migration 0009, as /api/directory), and
    // strip PII from metadata before it leaves the server.
    query = query.or(PUBLIC_REVIEW_FILTER);
    const [{ data, error }, blocked] = await Promise.all([query, blockedOwners(sessionClaims(req))]);
    if (error) throw error;
    return ok(withoutBlocked((data as Hearth[]) ?? [], blocked).map(publicHearth));
  } catch (err) {
    return serverError(err, "hearths.GET");
  }
}

export async function POST(req: NextRequest) {
  // Defence in depth (issue #381): refuse a cross-site POST with 403 before anything else.
  const crossSite = forbidCrossSite(req);
  if (crossSite) return crossSite;
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = createHearthSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("hearths")
      .insert({ status: "spark", ...parsed.data })
      .select("*")
      .single();
    if (error) throw error;
    return ok(data, 201);
  } catch (err) {
    return serverError(err, "hearths.POST");
  }
}

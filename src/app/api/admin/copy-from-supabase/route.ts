import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, serverError, badRequest, forbidCrossSite } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { copySupabaseToNeon } from "@/lib/db/copy";

// POST /api/admin/copy-from-supabase { apply?: boolean, withImages?: boolean }
// One-time move of Sparkz data from the old Supabase project to Neon (lib/db/copy.ts).
// Refuses a cross-site request with 403 first (the session cookie is SameSite=None, so a
// browser would attach it to a POST started by another site; seat-misc, #380), then admin
// only, both before any read. A dry run unless apply is true. Remove after the move.
export const maxDuration = 300;

const bodySchema = z.object({ apply: z.boolean().optional(), withImages: z.boolean().optional() });

export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;
    const denied = requireAdmin(req);
    if (denied) return denied;
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return badRequest("expected { apply?: boolean, withImages?: boolean }");
    const report = await copySupabaseToNeon({
      apply: parsed.data.apply === true,
      withImages: parsed.data.withImages === true,
    });
    return ok(report);
  } catch (err) {
    return serverError(err, "admin.copy-from-supabase.POST");
  }
}

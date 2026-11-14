import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, serverError, badRequest } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { copySupabaseToNeon } from "@/lib/db/copy";

// POST /api/admin/copy-from-supabase { apply?: boolean, withImages?: boolean }
// One-time move of Sparkz data from the old Supabase project to Neon (lib/db/copy.ts).
// Admin only, checked before anything else; a cross-site request has no session, so it
// is refused too. A dry run unless apply is true. Remove after the move.
export const maxDuration = 300;

const bodySchema = z.object({ apply: z.boolean().optional(), withImages: z.boolean().optional() });

export async function POST(req: NextRequest) {
  try {
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

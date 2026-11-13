import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { OWNER_BACKFILL, ZAO_HEARTHS } from "@/lib/zao-seed";

// POST /api/admin/seed-zao - "Set up the ZAO Hearths". Adds each ZAO Hearth whose
// slug does not exist yet (an existing one is kept untouched), then fills owner_fid on
// the listed Hearths only where it is NULL. Admin only. Safe to tap twice. Same rows
// as scripts/seed-zao-projects.mjs, from lib/zao-seed.ts.
export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const supabase = getServiceClient();
    const added: string[] = [];
    const kept: string[] = [];
    for (const h of ZAO_HEARTHS) {
      const { data: existing, error: readErr } = await supabase
        .from("hearths")
        .select("id")
        .eq("slug", h.slug)
        .maybeSingle();
      if (readErr) throw readErr;
      if (existing) {
        kept.push(h.slug);
        continue;
      }
      const { error } = await supabase.from("hearths").insert(h);
      if (error) throw error;
      added.push(h.slug);
    }

    const owned: string[] = [];
    for (const b of OWNER_BACKFILL) {
      const { data, error } = await supabase
        .from("hearths")
        .update({ owner_fid: b.owner_fid })
        .eq("slug", b.slug)
        .is("owner_fid", null)
        .select("slug");
      if (error) throw error;
      if (data && data.length > 0) owned.push(b.slug);
    }

    return ok({ added, kept, owned });
  } catch (err) {
    return serverError(err, "admin.seedZao.POST");
  }
}

import type { NextRequest } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { hearthIntegrations, hiddenIntegrations } from "@/lib/hearth-integrations";
import type { Hearth } from "@/lib/supabase/types";

// GET  /api/capsules/visibility?hearth_id=... - the Hearth's integrations + which are
//      hidden from the public page. Admin-gated (owner-scoped FID auth is the follow-up).
// POST /api/capsules/visibility - set the hidden list. Body { hearth_id, hidden_integrations }.
//
// Visibility is stored in the Hearth's metadata.hidden_integrations (an array of ids).
// The public /c/[slug] page reads it and hides those integrations.

export async function GET(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const hearthId = req.nextUrl.searchParams.get("hearth_id");
    if (!hearthId) return badRequest("hearth_id is required");

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("hearths")
      .select("id, slug, name, type, economic_config, metadata")
      .eq("id", hearthId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return badRequest("hearth not found");

    const hearth = data as Hearth;
    const { count } = await supabase
      .from("hearth_backers")
      .select("id", { count: "exact", head: true })
      .eq("hearth_id", hearthId)
      .like("backer_id", "%@%");

    return ok({
      hearth_id: hearth.id,
      slug: hearth.slug,
      name: hearth.name,
      integrations: hearthIntegrations(hearth, count ?? 0),
      hidden: hiddenIntegrations(hearth),
    });
  } catch (err) {
    return serverError(err, "hearths.visibility.GET");
  }
}

const schema = z.object({
  hearth_id: z.string().uuid(),
  hidden_integrations: z.array(z.string().min(1).max(40)).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { data: existing, error: readErr } = await supabase
      .from("hearths")
      .select("metadata")
      .eq("id", parsed.data.hearth_id)
      .maybeSingle();
    if (readErr) throw readErr;
    if (!existing) return badRequest("hearth not found");

    const metadata = {
      ...((existing.metadata as Record<string, unknown>) ?? {}),
      hidden_integrations: parsed.data.hidden_integrations,
    };
    const { error } = await supabase
      .from("hearths")
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq("id", parsed.data.hearth_id);
    if (error) throw error;

    return ok({ hearth_id: parsed.data.hearth_id, hidden: parsed.data.hidden_integrations });
  } catch (err) {
    return serverError(err, "hearths.visibility.POST");
  }
}

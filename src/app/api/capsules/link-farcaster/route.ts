import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { linkFarcasterSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import type { Hearth } from "@/lib/supabase/types";

// POST /api/capsules/link-farcaster - attach a Farcaster identity (fid / username
// / channel) to a Hearth. Stored in metadata.farcaster; used for share-to-channel
// casts and (later) auto-casting receipts + collabs. Admin-gated.
export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = linkFarcasterSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { data: hearth, error: capErr } = await supabase
      .from("hearths")
      .select("*")
      .eq("id", parsed.data.hearth_id)
      .maybeSingle();
    if (capErr) throw capErr;
    if (!hearth) return badRequest("hearth not found");

    const meta = (hearth as Hearth).metadata ?? {};
    const farcaster = {
      fid: parsed.data.fid ?? null,
      username: parsed.data.username ?? null,
      channel: parsed.data.channel ?? null,
    };

    const { data, error } = await supabase
      .from("hearths")
      .update({ metadata: { ...meta, farcaster } })
      .eq("id", parsed.data.hearth_id)
      .select("*")
      .single();
    if (error) throw error;

    return ok({ hearth: data as Hearth, farcaster });
  } catch (err) {
    return serverError(err, "hearths.linkFarcaster.POST");
  }
}

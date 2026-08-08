import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  getHearthPluginState,
  setHearthPlugin,
} from "@/lib/plugins/hearth-config";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

// GET  /api/capsules/plugins?hearth_id=... - the Hearth's full plugin state
//   (every built-in, with its per-Hearth enabled/config; defaults where no override).
// POST /api/capsules/plugins - toggle a plugin on/off and/or set its per-Hearth config.
//   Body: { hearth_id, plugin_id, enabled?, config? }. Admin-gated.
//
// This is how a Hearth connects to ITS OWN communities - e.g. set the approval-discord
// plugin's config to the Hearth's own webhook, or turn on signal-farcaster for its
// channel. Secrets in config are server-only and never returned to a public path.

export async function GET(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const hearthId = req.nextUrl.searchParams.get("hearth_id");
    if (!hearthId) return badRequest("hearth_id is required");

    const state = await getHearthPluginState(hearthId);
    return ok({ hearth_id: hearthId, plugins: state });
  } catch (err) {
    return serverError(err, "hearths.plugins.GET");
  }
}

const toggleSchema = z.object({
  hearth_id: z.string().uuid(),
  plugin_id: z.string().min(1).max(60),
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    if (parsed.data.enabled === undefined && parsed.data.config === undefined) {
      return badRequest("nothing to change - pass enabled and/or config");
    }

    await setHearthPlugin(parsed.data.hearth_id, parsed.data.plugin_id, {
      enabled: parsed.data.enabled,
      config: parsed.data.config,
    });

    const state = await getHearthPluginState(parsed.data.hearth_id);
    return ok({ hearth_id: parsed.data.hearth_id, plugins: state });
  } catch (err) {
    return serverError(err, "hearths.plugins.POST");
  }
}

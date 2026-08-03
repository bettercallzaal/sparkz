import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  getCapsulePluginState,
  setCapsulePlugin,
} from "@/lib/plugins/capsule-config";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

// GET  /api/capsules/plugins?capsule_id=... - the Capsule's full plugin state
//   (every built-in, with its per-Capsule enabled/config; defaults where no override).
// POST /api/capsules/plugins - toggle a plugin on/off and/or set its per-Capsule config.
//   Body: { capsule_id, plugin_id, enabled?, config? }. Admin-gated.
//
// This is how a Capsule connects to ITS OWN communities - e.g. set the approval-discord
// plugin's config to the Capsule's own webhook, or turn on signal-farcaster for its
// channel. Secrets in config are server-only and never returned to a public path.

export async function GET(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const capsuleId = req.nextUrl.searchParams.get("capsule_id");
    if (!capsuleId) return badRequest("capsule_id is required");

    const state = await getCapsulePluginState(capsuleId);
    return ok({ capsule_id: capsuleId, plugins: state });
  } catch (err) {
    return serverError(err, "capsules.plugins.GET");
  }
}

const toggleSchema = z.object({
  capsule_id: z.string().uuid(),
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

    await setCapsulePlugin(parsed.data.capsule_id, parsed.data.plugin_id, {
      enabled: parsed.data.enabled,
      config: parsed.data.config,
    });

    const state = await getCapsulePluginState(parsed.data.capsule_id);
    return ok({ capsule_id: parsed.data.capsule_id, plugins: state });
  } catch (err) {
    return serverError(err, "capsules.plugins.POST");
  }
}

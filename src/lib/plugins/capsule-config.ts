// Per-Capsule plugin state - the control-plane data layer over the capsule_plugins
// table. Merges the built-in plugin list (the defaults - everything enabled) with any
// per-Capsule overrides. A Capsule with no rows uses all defaults, so this is safe to
// call before the migration is applied: if the table is missing, we return defaults.
//
// This is the CONTROL plane (store + read which plugins a Capsule has on + its config).
// Having the loop CONSUME per-Capsule config (route approvals only to a Capsule's own
// enabled channels, with its own webhook) is the next increment.

import { getServiceClient } from "@/lib/supabase/server";
import { BUILT_IN_PLUGINS } from "./built-in";
import type { PluginMeta } from "./types";

// Listing available plugins derives from BUILT_IN_PLUGINS directly - the authoritative
// source - NOT the runtime registry Map. The Map is for component resolution
// (getSignalSource etc) and can be a different instance per route bundle under the dev
// bundler; the built-in list is a static import that is always populated.
function builtinMeta(): PluginMeta[] {
  return BUILT_IN_PLUGINS.map((p) => ({
    id: p.id,
    version: p.version,
    name: p.name,
    description: p.description,
    provides: {
      signalSources: (p.signalSources ?? []).map((s) => s.id),
      backingProviders: (p.backingProviders ?? []).map((b) => b.id),
      approvalChannels: (p.approvalChannels ?? []).map((c) => c.id),
    },
    configSchema: p.configSchema ?? {},
  }));
}

export interface CapsulePluginState {
  pluginId: string;
  name: string;
  description?: string;
  enabled: boolean;
  config: Record<string, unknown>;
  overridden: boolean; // true when a capsule_plugins row exists (not just defaults)
  configSchema: Record<string, { required?: boolean; secret?: boolean; description: string }>;
}

interface CapsulePluginRow {
  plugin_id: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

// The capsule_plugins table doesn't exist yet (migration 0004 not applied). Postgres
// raises 42P01; PostgREST (Supabase) surfaces it as PGRST205 with a "Could not find the
// table ... in the schema cache" message. Match either so this degrades to defaults
// cleanly before the migration is applied.
function isMissingTable(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (error.message ?? "").includes("Could not find the table")
  );
}

async function fetchOverrides(capsuleId: string): Promise<CapsulePluginRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("capsule_plugins")
    .select("plugin_id, enabled, config")
    .eq("capsule_id", capsuleId);
  if (error) {
    if (isMissingTable(error)) {
      console.warn(
        "[plugins] capsule_plugins table missing - apply migration 0004. Using defaults.",
      );
      return [];
    }
    throw error;
  }
  return (data ?? []) as CapsulePluginRow[];
}

/** The full plugin state for a Capsule: every built-in, with its per-Capsule override applied. */
export async function getCapsulePluginState(
  capsuleId: string,
): Promise<CapsulePluginState[]> {
  const [meta, overrides] = await Promise.all([
    Promise.resolve(builtinMeta()),
    fetchOverrides(capsuleId),
  ]);
  const byId = new Map(overrides.map((o) => [o.plugin_id, o]));

  return meta.map((p) => {
    const row = byId.get(p.id);
    return {
      pluginId: p.id,
      name: p.name,
      description: p.description,
      enabled: row ? row.enabled : true, // default: enabled
      config: row?.config ?? {},
      overridden: Boolean(row),
      configSchema: p.configSchema,
    };
  });
}

/** Turn a plugin on/off (and/or set its per-Capsule config) - upserts one row. */
export async function setCapsulePlugin(
  capsuleId: string,
  pluginId: string,
  patch: { enabled?: boolean; config?: Record<string, unknown> },
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("capsule_plugins").upsert(
    {
      capsule_id: capsuleId,
      plugin_id: pluginId,
      ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
      ...(patch.config !== undefined ? { config: patch.config } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "capsule_id,plugin_id" },
  );
  if (error) throw error;
}

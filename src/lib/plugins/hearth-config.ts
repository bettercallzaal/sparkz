// Per-Hearth plugin state - the control-plane data layer over the hearth_plugins
// table. Merges the built-in plugin list (the defaults - everything enabled) with any
// per-Hearth overrides. A Hearth with no rows uses all defaults, so this is safe to
// call before the migration is applied: if the table is missing, we return defaults.
//
// This is the CONTROL plane (store + read which plugins a Hearth has on + its config).
// Having the loop CONSUME per-Hearth config (route approvals only to a Hearth's own
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

export interface HearthPluginState {
  pluginId: string;
  name: string;
  description?: string;
  enabled: boolean;
  config: Record<string, unknown>;
  overridden: boolean; // true when a hearth_plugins row exists (not just defaults)
  configSchema: Record<string, { required?: boolean; secret?: boolean; description: string }>;
}

interface HearthPluginRow {
  plugin_id: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

// The hearth_plugins table doesn't exist yet (migration 0004 not applied). Postgres
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

async function fetchOverrides(hearthId: string): Promise<HearthPluginRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("capsule_plugins")
    .select("plugin_id, enabled, config")
    .eq("capsule_id", hearthId);
  if (error) {
    if (isMissingTable(error)) {
      console.warn(
        "[plugins] hearth_plugins table missing - apply migration 0004. Using defaults.",
      );
      return [];
    }
    throw error;
  }
  return (data ?? []) as HearthPluginRow[];
}

/** The full plugin state for a Hearth: every built-in, with its per-Hearth override applied. */
export async function getHearthPluginState(
  hearthId: string,
): Promise<HearthPluginState[]> {
  const [meta, overrides] = await Promise.all([
    Promise.resolve(builtinMeta()),
    fetchOverrides(hearthId),
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

/** Turn a plugin on/off (and/or set its per-Hearth config) - upserts one row. */
export async function setHearthPlugin(
  hearthId: string,
  pluginId: string,
  patch: { enabled?: boolean; config?: Record<string, unknown> },
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("capsule_plugins").upsert(
    {
      capsule_id: hearthId,
      plugin_id: pluginId,
      ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
      ...(patch.config !== undefined ? { config: patch.config } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "capsule_id,plugin_id" },
  );
  if (error) throw error;
}

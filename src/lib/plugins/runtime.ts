// The per-Hearth runtime view of the spokes: which components the app may use for
// ONE Hearth, given its hearth_spokes toggles. This is what turns the toggles from
// control-plane data into behavior - the Hearth page's connector grid asks this
// instead of the global registries.
//
// Pure (no DB): hearth-config.ts loads the state and calls buildRuntime, so this
// file can be unit-tested on its own (runtime.test.ts).

import type { HearthPlugin } from "./types";
import type { Connector } from "../adapters/connector";

export interface SpokeState {
  pluginId: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface HearthRuntime {
  /** Is this spoke on for the Hearth? Unknown plugin ids are off. */
  isEnabled(pluginId: string): boolean;
  /** Connectors that are on, each with its spoke's per-Hearth config. */
  enabledConnectors: { connector: Connector; config: Record<string, unknown> }[];
}

export function buildRuntime(plugins: HearthPlugin[], state: SpokeState[]): HearthRuntime {
  const byId = new Map(state.map((s) => [s.pluginId, s]));
  // A spoke with no state row is on (the default in getHearthPluginState); a spoke
  // that is not a known plugin is never on.
  const known = new Set(plugins.map((p) => p.id));
  const on = (id: string) => known.has(id) && (byId.get(id)?.enabled ?? true);
  const enabledPlugins = plugins.filter((p) => on(p.id));

  const connectors: HearthRuntime["enabledConnectors"] = [];
  for (const p of enabledPlugins) {
    p.connectors?.forEach((c) => connectors.push({ connector: c, config: byId.get(p.id)?.config ?? {} }));
  }

  return {
    isEnabled: on,
    enabledConnectors: connectors,
  };
}

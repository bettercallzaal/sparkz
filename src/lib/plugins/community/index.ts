// Community spokes - vendor-contributed integrations, registered alongside the
// built-ins at boot. A vendor adds their tool by dropping a folder here (a spoke.json
// manifest + an index.ts exporting a HearthPlugin) and adding one line to this array.
// Everything else - toggling, config, the integrations grid - is handled by the hub.
//
// Spokes are enabled per-Hearth via the hearth_plugins table (default on, toggle off
// per community). Secrets stay server-only (configSchema.secret). A broken spoke
// degrades to off and can never take the hub down.

import type { HearthPlugin } from "@/lib/plugins/types";
import { audiusCatalogSpoke } from "./audius-catalog";

export const COMMUNITY_SPOKES: HearthPlugin[] = [
  audiusCatalogSpoke,
  // Add your spoke here: `import { yourSpoke } from "./your-tool";` then list it.
];

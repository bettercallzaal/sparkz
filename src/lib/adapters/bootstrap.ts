// Boot the adapter seams by registering the built-in plugins. Each plugin fans its
// components into the existing signal-source / backing-provider / approval-channel
// registries, so every call site (getSignalSource, routeApproval, ...) is unchanged.
//
// Exposed as an idempotent function AND run on import: routes that do
// `import "@/lib/adapters/bootstrap"` still get registration on module load, while
// callers that need a guarantee (a bare side-effect import can be dropped by the
// bundler in some route contexts) call ensureBuiltinPlugins() explicitly. The guard +
// the seams' own id-dedupe make repeat calls a no-op.
import { registerPlugin } from "@/lib/plugins/registry";
import { BUILT_IN_PLUGINS } from "@/lib/plugins/built-in";

// No module-level guard on purpose: under the bundler's per-route module graphs the
// registry can be a different instance than a shared boolean flag would assume, so a
// guard could skip registering into THIS route's registry. registerPlugin is idempotent
// (plugins keyed by id; seams dedupe by component id), so re-running is a cheap no-op.
export function ensureBuiltinPlugins(): void {
  for (const plugin of BUILT_IN_PLUGINS) {
    registerPlugin(plugin);
  }
}

ensureBuiltinPlugins();

// Boot the adapter seams by registering the built-in plugins. Each plugin fans its
// components into the existing signal-source / backing-provider / approval-channel
// registries, so every call site (getSignalSource, routeApproval, ...) is unchanged.
// Registration now flows through the plugin layer (src/lib/plugins) instead of
// per-adapter self-register side effects - one door, and the plugin metadata is
// listable for the per-Capsule toggle work.
import { registerPlugin } from "@/lib/plugins/registry";
import { BUILT_IN_PLUGINS } from "@/lib/plugins/built-in";

for (const plugin of BUILT_IN_PLUGINS) {
  registerPlugin(plugin);
}

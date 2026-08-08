// Plugin registry - the one place a HearthPlugin is registered. Registering a plugin
// (a) records its metadata for listing, and (b) fans each of its components into the
// EXISTING adapter registries, so every current call site (getSignalSource,
// getBackingProvider, listApprovalChannels, routeApproval) keeps working unchanged.
//
// This is deliberately additive: the plugin layer is a bundling/metadata wrapper over
// the four seams, not a replacement. Per-Hearth enable/disable + config is layered on
// top later via the hearth_plugins table + a HearthRuntime.

import { registerSignalSource } from "@/lib/adapters/signal-source";
import { registerBackingProvider } from "@/lib/adapters/backing-provider";
import { registerApprovalChannel } from "@/lib/adapters/approval-channel";
import type { HearthPlugin, PluginMeta } from "./types";

const plugins = new Map<string, HearthPlugin>();

/**
 * Register a plugin: store it and fan its components into the existing seams.
 * Idempotent per id - re-registering the same id replaces the metadata entry but the
 * underlying seams dedupe by their own component id, so this is safe on hot reload.
 */
export function registerPlugin(plugin: HearthPlugin): void {
  plugins.set(plugin.id, plugin);
  plugin.signalSources?.forEach(registerSignalSource);
  plugin.backingProviders?.forEach(registerBackingProvider);
  plugin.approvalChannels?.forEach(registerApprovalChannel);
}

export function getPlugin(id: string): HearthPlugin | undefined {
  return plugins.get(id);
}

export function listPlugins(): HearthPlugin[] {
  return [...plugins.values()];
}

/** Safe, listable metadata (no component internals, no secret values). */
export function listPluginMeta(): PluginMeta[] {
  return [...plugins.values()].map((p) => ({
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

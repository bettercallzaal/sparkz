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
import { registerConnector } from "@/lib/adapters/connector";
import type { HearthPlugin } from "./types";

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
  plugin.connectors?.forEach(registerConnector);
}


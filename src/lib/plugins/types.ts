// Hearth Plugin system (Upgrade: unified adapter toggling), modeled on elizaOS.
//
// A HearthPlugin bundles one or more of Sparkz's existing adapter components -
// signal sources, backing providers, approval channels - behind a single id +
// metadata + config contract. This is the ADDITIVE layer over the four seams that
// already exist (src/lib/adapters/*): registering a plugin just fans its components
// into those registries, so the flag -> draft -> approve loop is untouched. Per-Hearth
// enable/disable + config lands next (the hearth_plugins table).
//
// elizaOS parallel: Plugin -> HearthPlugin, character.plugins[] -> hearth_plugins
// rows, AgentRuntime.registerPlugin -> registerPlugin below.

import type { SignalSource } from "@/lib/adapters/signal-source";
import type { BackingProvider } from "@/lib/adapters/backing-provider";
import type { ApprovalChannel } from "@/lib/adapters/approval-channel";
import type { Connector } from "@/lib/adapters/connector";

// One declared config key for a plugin (mirrors elizaOS pluginParameters). `secret`
// marks server-only values (API keys) that must never reach the browser.
export interface PluginConfigField {
  required?: boolean;
  secret?: boolean;
  description: string;
}

// A HearthPlugin (a "spoke") bundles one or more adapter components behind a single id.
// A vendor adds their tool as a Connector spoke - no bespoke seam needed. Modeled on
// elizaOS's Plugin (id + bundled components + optional lifecycle + declared config).
export interface HearthPlugin {
  /** Stable unique id, e.g. "signal-human", "backing-ledger", "connector-audius". */
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly description?: string;

  /** Component arrays - a plugin provides any subset of the four seams. */
  readonly signalSources?: SignalSource[];
  readonly backingProviders?: BackingProvider[];
  readonly approvalChannels?: ApprovalChannel[];
  /** The generic spoke: any vendor tool wired to the Hearth. */
  readonly connectors?: Connector[];

  /** Config keys this plugin reads (declared, not the values). Secrets stay server-only. */
  readonly configSchema?: Record<string, PluginConfigField>;

  /**
   * Optional lifecycle (elizaOS Plugin.init/dispose). `init` runs once when the spoke is
   * enabled for a Hearth - validate config, test the external API. `dispose` cleans up on
   * disable. Both optional; a spoke that just declares components needs neither.
   */
  init?(config: Record<string, unknown>, hearthId: string): Promise<void> | void;
  dispose?(hearthId: string): Promise<void> | void;
}

// Public metadata for listing available plugins (no component internals). This is what
// an admin plugin-toggle UI and the /api plugin endpoints expose.
export interface PluginMeta {
  id: string;
  version: string;
  name: string;
  description?: string;
  provides: {
    signalSources: string[];
    backingProviders: string[];
    approvalChannels: string[];
    connectors: string[];
  };
  configSchema: Record<string, PluginConfigField>;
}

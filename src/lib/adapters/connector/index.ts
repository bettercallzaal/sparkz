// Connector seam - the generic "spoke" any vendor can add to a Hearth.
//
// The other three seams are specific (a signal SOURCE, a backing PROVIDER, an approval
// CHANNEL). A Connector is the open-ended fourth: it represents ANY external tool a
// community wires to their Hearth - a token rail, a Discord, an Audius catalog, a
// treasury, a bounty board. This is what lets a vendor add THEIR tool without Sparkz
// needing a bespoke seam for it. The Hearth is the hub; each Connector is a spoke.
//
// A Connector stays deliberately small: it declares what it is and, optionally, how to
// report its live status for a given Hearth (so the integrations grid on /c/[slug] can
// show "connected / not linked" per spoke). It never gets DB access or shared state -
// it reads its declared config and talks to its own external API. A broken or malicious
// spoke is toggle-off-able per Hearth and can never take the hub down.

export interface ConnectorStatus {
  /** Is this spoke live for the Hearth? */
  connected: boolean;
  /** Short human summary shown in the integrations grid, e.g. "3 on list", "not linked". */
  label: string;
  /** Optional longer detail. */
  detail?: string;
  /** Optional deep link to the connected tool. */
  url?: string;
}

export interface Connector {
  /** Stable unique id, e.g. "connector-audius", "connector-discord". */
  readonly id: string;
  /** Category shown in the integrations grid, e.g. "distribution", "treasury", "catalog". */
  readonly kind: string;
  /** Display name, e.g. "Audius Catalog". */
  readonly label: string;
  /**
   * Optional: report this spoke's status for a Hearth. Pure read - talks to the
   * connector's own external API using its declared config; no DB, no shared state.
   * Must fail soft (a throwing/broken spoke must never break the hub - callers guard).
   */
  status?(hearthId: string): Promise<ConnectorStatus>;
}

const registry = new Map<string, Connector>();

export function registerConnector(connector: Connector): void {
  registry.set(connector.id, connector);
}

export function getConnector(id: string): Connector | undefined {
  return registry.get(id);
}

export function listConnectors(): Connector[] {
  return [...registry.values()];
}

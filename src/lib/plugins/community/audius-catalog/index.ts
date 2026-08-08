// Example community spoke - a Connector that a vendor could contribute.
//
// This is the reference a vendor copies: a folder under community/ with a spoke.json
// manifest and this index.ts exporting a HearthPlugin whose only component is a
// Connector. It declares its config (AUDIUS_APP_NAME - not a secret) and reports a
// status for the integrations grid. It never touches the DB or shared state; it would
// read its config and call the Audius public API. Dark (connected:false) until config
// is set, so it is safe to ship disabled-by-default.

import type { HearthPlugin } from "@/lib/plugins/types";
import type { Connector, ConnectorStatus } from "@/lib/adapters/connector";

const audiusConnector: Connector = {
  id: "connector-audius",
  kind: "catalog",
  label: "Audius Catalog",
  async status(): Promise<ConnectorStatus> {
    // A real spoke would read config + call the Audius API here. Kept pure + fail-soft:
    // dark until configured, so a missing key can never break the hub.
    const appName = process.env.AUDIUS_APP_NAME?.trim();
    if (!appName) {
      return { connected: false, label: "not linked" };
    }
    return {
      connected: true,
      label: "catalog linked",
      url: "https://audius.co",
    };
  },
};

export const audiusCatalogSpoke: HearthPlugin = {
  id: "connector-audius",
  version: "1.0.0",
  name: "Audius Catalog",
  description: "Link an artist's Audius catalog to their Hearth. Dark until configured.",
  connectors: [audiusConnector],
  configSchema: {
    AUDIUS_APP_NAME: {
      required: false,
      secret: false,
      description: "Your Audius app name (read-only catalog reads). When set, the spoke goes live.",
    },
  },
};

export default audiusCatalogSpoke;

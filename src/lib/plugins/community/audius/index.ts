// Audius spoke - the first LIVE API integration. It links an artist's Audius catalog to
// their Hearth. Real: the connector calls the Audius public API via ./client. Fail-soft +
// dark until a handle is configured, so it can never break the hub.

import type { HearthPlugin } from "@/lib/plugins/types";
import type { Connector, ConnectorStatus } from "@/lib/adapters/connector";
import { getAudiusCatalog } from "./client";

const audiusConnector: Connector = {
  id: "connector-audius",
  kind: "catalog",
  label: "Audius Catalog",
  async status(): Promise<ConnectorStatus> {
    // A Hearth's Audius handle is configured server-side (AUDIUS_HANDLE) until per-Hearth
    // config is wired. Dark (not linked) until set - then it reports the REAL track count.
    const handle = process.env.AUDIUS_HANDLE?.trim();
    if (!handle) return { connected: false, label: "not linked" };
    const cat = await getAudiusCatalog(handle);
    if (!cat.found) return { connected: false, label: "handle not found" };
    return {
      connected: true,
      label: `${cat.trackCount ?? 0} tracks`,
      url: cat.profileUrl,
    };
  },
};

export const audiusSpoke: HearthPlugin = {
  id: "connector-audius",
  version: "1.0.0",
  name: "Audius Catalog",
  description:
    "Link an artist's Audius catalog to their Hearth - live reads from the Audius public API.",
  connectors: [audiusConnector],
  configSchema: {
    AUDIUS_HANDLE: {
      required: false,
      secret: false,
      description: "The Hearth's Audius handle (e.g. 'deadmau5'). When set, the catalog goes live.",
    },
  },
};

export default audiusSpoke;
export { getAudiusCatalog } from "./client";
export type { AudiusCatalog, AudiusTrack } from "./client";

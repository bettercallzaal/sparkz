import { getHearthRuntime } from "@/lib/plugins/hearth-config";
import type { Integration } from "@/lib/hearth-integrations";
import type { Connector, ConnectorStatus } from "@/lib/adapters/connector";

// Connector spokes on a Hearth's integrations grid: for each connector the Hearth has
// switched on, ask Connector.status() with the Hearth's own config. Only live
// (connected) spokes are shown - an unlinked spoke on every Hearth would be noise.
//
// Fail-soft by contract: a missing table, a slow vendor API or a throwing spoke
// drops that card (or all connector cards); it never breaks the Hearth page.

const STATUS_TIMEOUT_MS = 3000;
// The Hearth page is force-dynamic, which turns off Next's fetch cache, so without
// this every page view would call each vendor API. Statuses are cached in-process
// per (connector, Hearth, config) for a few minutes; failures are not cached.
const STATUS_TTL_MS = 5 * 60 * 1000;
const statusCache = new Map<string, { at: number; status: ConnectorStatus }>();

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

async function cachedStatus(
  connector: Connector,
  hearthId: string,
  config: Record<string, unknown>,
): Promise<ConnectorStatus> {
  const key = `${connector.id}|${hearthId}|${JSON.stringify(config)}`;
  const hit = statusCache.get(key);
  if (hit && Date.now() - hit.at < STATUS_TTL_MS) return hit.status;
  const status = await withTimeout(connector.status!(hearthId, config), STATUS_TIMEOUT_MS);
  statusCache.set(key, { at: Date.now(), status });
  return status;
}

export async function connectorIntegrations(hearthId: string): Promise<Integration[]> {
  let runtime;
  try {
    runtime = await getHearthRuntime(hearthId);
  } catch (err) {
    console.warn("[sparkz:connectors] runtime unavailable:", (err as Error).message);
    return [];
  }

  const cards = await Promise.all(
    runtime.enabledConnectors.map(async ({ connector, config }) => {
      if (!connector.status) return null;
      try {
        const st = await cachedStatus(connector, hearthId, config);
        if (!st.connected) return null;
        const card: Integration = {
          id: connector.id,
          label: connector.label,
          sub: connector.kind,
          connected: true,
          value: st.label,
          href: st.url,
        };
        return card;
      } catch (err) {
        console.warn(`[sparkz:connectors] ${connector.id} status failed:`, (err as Error).message);
        return null;
      }
    }),
  );
  return cards.filter((c): c is Integration => c !== null);
}

import { getHearthRuntime } from "@/lib/plugins/hearth-config";
import type { Integration } from "@/lib/hearth-integrations";

// Connector spokes on a Hearth's integrations grid: for each connector the Hearth has
// switched on, ask Connector.status() with the Hearth's own config. Only live
// (connected) spokes are shown - an unlinked spoke on every Hearth would be noise.
//
// Fail-soft by contract: a missing table, a slow vendor API or a throwing spoke
// drops that card (or all connector cards); it never breaks the Hearth page.

const STATUS_TIMEOUT_MS = 3000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
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
        const st = await withTimeout(connector.status(hearthId, config), STATUS_TIMEOUT_MS);
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

import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CLANKER_V4_FACTORY_BASE, tokenFromReceipt } from "./launch-summary";

// Review round 2, item 4: the server reads the deploy tx on Base itself instead of
// trusting base_token and tx_hash from the browser.

export interface DeployTx {
  found: boolean;
  status?: "success" | "reverted";
  from?: string;
  to?: string | null;
  logs?: { address: string; topics: readonly string[] }[];
}

export async function readDeployTx(hash: string): Promise<DeployTx> {
  const client = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
  });
  try {
    const [tx, receipt] = await Promise.all([
      client.getTransaction({ hash: hash as `0x${string}` }),
      client.getTransactionReceipt({ hash: hash as `0x${string}` }),
    ]);
    return {
      found: true,
      status: receipt.status,
      from: tx.from,
      to: tx.to,
      logs: receipt.logs.map((l) => ({ address: l.address, topics: l.topics })),
    };
  } catch {
    return { found: false };
  }
}

// Pure check of what readDeployTx saw. null = the tx made baseToken from owner's wallet.
export function deployTxProblem(tx: DeployTx, expect: { owner: string; baseToken: string }): string | null {
  if (!tx.found) return "That launch is not confirmed on Base yet. Wait a minute and press Finish launch.";
  if (tx.status !== "success") return "That launch failed on Base, so no coin exists.";
  if ((tx.from ?? "").toLowerCase() !== expect.owner.toLowerCase()) return "That launch was not sent from the owner's wallet.";
  if ((tx.to ?? "").toLowerCase() !== CLANKER_V4_FACTORY_BASE.toLowerCase()) return "That transaction did not go to the Clanker factory.";
  const made = tokenFromReceipt(tx.logs ?? []);
  if (!made || made.toLowerCase() !== expect.baseToken.toLowerCase()) return "That transaction did not create this coin.";
  return null;
}

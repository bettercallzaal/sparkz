import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { poidhAbi, POIDH_CONTRACT_ADDRESS, poidhBountyUrl } from "./abi";
import { bountyState, type BountyState } from "./vote-state";

// Read-only Base client. No private key exists anywhere in this module or this app: every
// write is signed by the user's own wallet in the browser.
const abi = parseAbi(poidhAbi);
const make = () => createPublicClient({ chain: base, transport: http(undefined, { timeout: 8_000, retryCount: 1 }) });
type PublicClient = ReturnType<typeof make>;
let cached: PublicClient | null = null;

// Tests only: swap in a fake chain client.
export function setBaseClientForTests(c: unknown): void {
  cached = c as PublicClient | null;
}

export function baseClient(): PublicClient {
  // The public Base RPC (viem default). A paid RPC would be a new env var: not added without a yes from Zaal.
  cached ??= make();
  return cached;
}

export type ChainClaim = {
  id: string; issuer: string; name: string; description: string; createdAt: number; accepted: boolean;
};
export type ChainBounty = {
  id: string; issuer: string; name: string; description: string; amountWei: string;
  createdAt: number; claimer: string; state: BountyState;
  claims: ChainClaim[]; participants: { address: string; amountWei: string }[];
  url: string;
};

const addr = POIDH_CONTRACT_ADDRESS;

// Everything about ONE bounty, read from Base. Claims and participants are capped at the
// contract's own page size (10 claims, 150 participants) - enough for v1.
async function readBountyUncached(id: bigint, client: PublicClient): Promise<ChainBounty | null> {
  const length = (await client.readContract({ address: addr, abi, functionName: "getBountiesLength" })) as bigint;
  if (id >= length) return null;
  const [b, cur, tracker, claims, parts] = await Promise.all([
    client.readContract({ address: addr, abi, functionName: "bounties", args: [id] }),
    client.readContract({ address: addr, abi, functionName: "bountyCurrentVotingClaim", args: [id] }),
    client.readContract({ address: addr, abi, functionName: "bountyVotingTracker", args: [id] }),
    client.readContract({ address: addr, abi, functionName: "getClaimsByBountyId", args: [id, 0n] }),
    client.readContract({ address: addr, abi, functionName: "getParticipantsPaged", args: [id, 0n, 150n] }),
  ]);
  const bt = b as readonly [bigint, string, string, string, bigint, string, bigint, bigint];
  const tr = tracker as readonly [bigint, bigint, bigint];
  const [addrs, amts] = parts as readonly [readonly string[], readonly bigint[]];
  const state = bountyState(
    { issuer: bt[1], claimer: bt[5], claimId: bt[7] },
    { currentClaim: cur as bigint, yes: tr[0], no: tr[1], deadline: tr[2] },
    Math.floor(Date.now() / 1000),
  );
  return {
    id: bt[0].toString(), issuer: bt[1].toLowerCase(), name: bt[2], description: bt[3],
    amountWei: bt[4].toString(), claimer: bt[5].toLowerCase(), createdAt: Number(bt[6]), state,
    // getClaimsByBountyId pads to 10 slots with empty structs (issuer 0x0): drop those.
    claims: (claims as readonly { id: bigint; issuer: string; name: string; description: string; createdAt: bigint; accepted: boolean }[])
      .filter((c) => c.issuer !== "0x0000000000000000000000000000000000000000")
      .map((c) => ({ id: c.id.toString(), issuer: c.issuer.toLowerCase(), name: c.name, description: c.description, createdAt: Number(c.createdAt), accepted: c.accepted })),
    participants: addrs.map((a, i) => ({ address: a.toLowerCase(), amountWei: amts[i].toString() })),
    // The poidh.xyz page id is NOT the on-chain id (see POIDH_BASE_LAST_PRE_V3_BOUNTY).
    url: poidhBountyUrl(id),
  };
}

// A Hearth page view reads every linked bounty (about 6 RPC calls each). Cache each bounty's
// read for 60 seconds per server instance so page views do not hit the public Base RPC every
// time. Only successful reads are cached; a failure is retried on the next view.
const TTL_MS = 60_000;
const MAX_CACHED = 200;
const readCache = new Map<string, { at: number; value: ChainBounty | null }>();

export async function readBounty(id: bigint, client: PublicClient = baseClient()): Promise<ChainBounty | null> {
  const key = id.toString();
  const hit = readCache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const value = await readBountyUncached(id, client);
  if (readCache.size >= MAX_CACHED) readCache.delete(readCache.keys().next().value as string);
  readCache.set(key, { at: Date.now(), value });
  return value;
}

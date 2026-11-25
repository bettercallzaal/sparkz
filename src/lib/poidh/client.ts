import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { poidhAbi, POIDH_CONTRACT_ADDRESS } from "./abi";
import { bountyState, type BountyState } from "./vote-state";

// Read-only Base client. No private key exists anywhere in this module or this app: every
// write is signed by the user's own wallet in the browser.
const abi = parseAbi(poidhAbi);
const make = () => createPublicClient({ chain: base, transport: http() });
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
export async function readBounty(id: bigint, client: PublicClient = baseClient()): Promise<ChainBounty | null> {
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
    url: `https://poidh.xyz/base/bounty/${id.toString()}`,
  };
}

import { decodeEventLog, parseAbi, type Hex } from "viem";
import { poidhAbi, POIDH_CONTRACT_ADDRESS } from "./abi";

// Pure check of a Base transaction receipt: did this tx create an open poidh bounty, sent
// by the wallet that signed it, to the poidh contract? Returns the on-chain facts or a
// plain reason. Never trusts anything the browser claimed beyond the tx hash.
export type ReceiptLike = {
  status: string; // "success" | "reverted"
  from: string;
  to: string | null;
  logs: { address: string; data: Hex; topics: readonly Hex[] }[];
};

export type CreatedBounty = {
  bountyId: string;
  issuer: string;
  name: string;
  description: string;
  amountWei: string;
  isOpen: boolean;
};

const abi = parseAbi(poidhAbi);
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function parseCreatedBounty(
  r: ReceiptLike,
  contract: string = POIDH_CONTRACT_ADDRESS,
): { ok: true; bounty: CreatedBounty } | { ok: false; reason: string } {
  if (r.status !== "success") return { ok: false, reason: "transaction did not succeed" };
  if (!r.to || !same(r.to, contract)) return { ok: false, reason: "transaction was not sent to poidh" };
  for (const log of r.logs) {
    if (!same(log.address, contract)) continue;
    try {
      const ev = decodeEventLog({ abi, data: log.data, topics: [...log.topics] as [Hex, ...Hex[]] });
      if (ev.eventName !== "BountyCreated") continue;
      const a = ev.args as unknown as {
        id: bigint; issuer: string; title: string; description: string; amount: bigint; isOpenBounty: boolean;
      };
      if (!same(a.issuer, r.from)) return { ok: false, reason: "bounty issuer is not the sending wallet" };
      if (!a.isOpenBounty) return { ok: false, reason: "not an open bounty" };
      return {
        ok: true,
        bounty: {
          bountyId: a.id.toString(),
          issuer: a.issuer.toLowerCase(),
          name: a.title,
          description: a.description,
          amountWei: a.amount.toString(),
          isOpen: a.isOpenBounty,
        },
      };
    } catch {
      continue; // a log from the contract that is not BountyCreated
    }
  }
  return { ok: false, reason: "no BountyCreated event in the transaction" };
}

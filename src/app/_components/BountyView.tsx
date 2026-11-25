import { formatEth, type BountyStatus } from "@/lib/poidh/vote-state";
import { POIDH_SITE } from "@/lib/poidh/abi";
import type { ChainBounty } from "@/lib/poidh/client";

// One poidh bounty, everything read from Base: text, funding, funders, claims, vote state.
// Presentational and server-rendered; every write (fund, claim, vote) happens on poidh.xyz
// with the visitor's own wallet. Sparkz never holds funds.
const STATUS_LABEL: Record<BountyStatus, string> = {
  open: "Open",
  voting: "Vote in progress",
  vote_ended: "Vote ended, waiting to be resolved",
  accepted: "Claim accepted",
  cancelled: "Cancelled",
};

const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
const basescan = (path: string) => `https://basescan.org/${path}`;

export default function BountyView({ bounty, txHash }: { bounty: ChainBounty | null; txHash: string }) {
  if (!bounty) {
    return (
      <li className="card-solid p-4 text-sm text-muted">
        The live state of this bounty could not be read from Base right now.{" "}
        <a className="text-accent hover:underline" href={basescan(`tx/${txHash}`)} target="_blank" rel="noreferrer">
          View the transaction
        </a>
        .
      </li>
    );
  }
  const v = bounty.state.vote;
  return (
    <li className="card-solid space-y-3 p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium">{bounty.name}</h3>
        <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent">
          {STATUS_LABEL[bounty.state.status]}
        </span>
      </div>
      <p className="whitespace-pre-line text-muted">{bounty.description}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span>Reward {formatEth(bounty.amountWei)} ETH on Base</span>
        <span>
          {bounty.participants.length >= 150 ? "150+" : bounty.participants.length} funder{bounty.participants.length === 1 ? "" : "s"}
        </span>
        <span>
          {bounty.claims.length >= 10 ? "10+" : bounty.claims.length} claim{bounty.claims.length === 1 ? "" : "s"}
        </span>
        <span>
          Posted by{" "}
          <a className="text-accent hover:underline" href={basescan(`address/${bounty.issuer}`)} target="_blank" rel="noreferrer">
            {short(bounty.issuer)}
          </a>
        </span>
      </div>

      {v && (
        <div className="rounded-lg border border-border p-3 text-xs">
          <div className="mb-1 font-medium">Vote on claim #{v.claimId}</div>
          <div className="text-muted">
            Yes {formatEth(v.yes)} ETH of weight, No {formatEth(v.no)} ETH. {v.passing ? "Passing" : "Not passing"} right now.
            {bounty.state.status === "voting"
              ? ` Closes ${new Date(v.deadline * 1000).toLocaleString()}.`
              : " The deadline has passed."}
          </div>
        </div>
      )}

      {bounty.claims.length > 0 && (
        <ul className="space-y-1.5">
          {bounty.claims.map((c) => (
            <li key={c.id} className="rounded-lg border border-border px-3 py-2 text-xs">
              <span className="font-medium">{c.name}</span>
              {c.accepted && <span className="ml-2 text-accent">accepted</span>}
              <span className="ml-2 text-muted">by {short(c.issuer)}</span>
              {c.description && <p className="mt-1 text-muted">{c.description}</p>}
            </li>
          ))}
        </ul>
      )}

      <a className="inline-block text-xs text-accent hover:underline" href={bounty.url} target="_blank" rel="noreferrer">
        Fund, claim or vote on poidh.xyz
      </a>
    </li>
  );
}

export function PoidhLink() {
  return (
    <a className="text-accent hover:underline" href={POIDH_SITE} target="_blank" rel="noreferrer">
      poidh.xyz
    </a>
  );
}

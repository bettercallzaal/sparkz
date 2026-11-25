import { listHearthBounties, type HearthBountyView } from "@/lib/poidh/hearth-bounties";
import BountyView, { PoidhLink } from "./BountyView";
import CreateBountyForm from "./CreateBountyForm";

// The Bounties tab on a Hearth page: a poidh bounty is a Spark opportunity on the Hearth.
// Bounties linked to THIS Hearth are read from Base and shown in full; every other poidh
// bounty lives on poidh.xyz. The owner sees the create form (owner-only, enforced again on
// the server); everyone else reads.
export default async function HearthBountiesTab({
  hearthId,
  hearthName,
  ownerFid,
}: {
  hearthId: string;
  hearthName: string;
  ownerFid: number | null;
}) {
  let items: HearthBountyView[] = [];
  let failed = false;
  try {
    items = await listHearthBounties(hearthId);
  } catch (err) {
    console.error("[sparkz:hearth.bounties]", err);
    failed = true;
  }
  return (
    <section>
      <h2 className="mb-1 text-sm font-medium">Bounties</h2>
      <p className="mb-3 text-xs text-muted">
        Open a bounty for work {hearthName} needs done. The reward is held by poidh&apos;s contract on Base, not by
        Sparkz. Other bounties live on <PoidhLink />.
      </p>
      <CreateBountyForm hearthId={hearthId} ownerFid={ownerFid} />
      {failed ? (
        <p className="rounded-lg border border-dashed border-border p-5 text-sm text-muted">
          Bounties could not be loaded right now. Try again in a moment.
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-5 text-sm text-muted">No bounties yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <BountyView key={i.row.id} bounty={i.chain} txHash={i.row.txHash} />
          ))}
        </ul>
      )}
    </section>
  );
}

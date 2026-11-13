"use client";

import Link from "next/link";
import { useViewer, useViewerProfile } from "@/lib/view-as";
import ShareButton from "./ShareButton";
import { ClaimHearthButton } from "./AdminSetup";

// The row of large actions under a Hearth's header: Share, Boost, and Edit for the
// owner. 44pt targets on phone. Pattern credit (design brief D1): Luma's host tools
// put share and manage one tap from the event page.
export default function HearthActions({
  slug,
  name,
  ownerFid,
  channel,
  hearthId,
}: {
  slug: string;
  name: string;
  ownerFid: number | null;
  channel?: string;
  /** Needed for "Make me the owner" on a Hearth with no owner (admins only). */
  hearthId?: string;
}) {
  const { isAuthenticated, profile } = useViewerProfile();
  // An admin may edit any Hearth: requireHearthOwner (lib/auth.ts) already lets an
  // admin session through on the server, so this only shows the button it allows.
  const { admin } = useViewer();
  const isOwner = admin || (!!ownerFid && isAuthenticated && profile?.fid === ownerFid);
  const btn =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium active:bg-white/10 sm:flex-none";

  return (
    <div className="mt-4 flex gap-2">
      <ShareButton
        path={`/c/${slug}`}
        text={`Backing ${name} on Sparkz.`}
        channel={channel}
        className="flex-1 sm:flex-none [&>button]:w-full"
      />
      <a href="#boost" className={`btn-spark ${btn} border-transparent`}>
        Boost
      </a>
      {isOwner && (
        <Link href={`/c/${slug}/settings`} className={btn}>
          Edit
        </Link>
      )}
      {admin && ownerFid === null && hearthId && (
        <ClaimHearthButton hearthId={hearthId} className={btn} />
      )}
    </div>
  );
}

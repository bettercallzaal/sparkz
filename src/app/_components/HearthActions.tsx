"use client";

import Link from "next/link";
import { useProfile } from "@farcaster/auth-kit";
import ShareButton from "./ShareButton";

// The row of large actions under a Hearth's header: Share, Boost, and Edit for the
// owner. 44pt targets on phone. Pattern credit (design brief D1): Luma's host tools
// put share and manage one tap from the event page.
export default function HearthActions({
  slug,
  name,
  ownerFid,
  channel,
}: {
  slug: string;
  name: string;
  ownerFid: number | null;
  channel?: string;
}) {
  const { isAuthenticated, profile } = useProfile();
  const isOwner = !!ownerFid && isAuthenticated && profile?.fid === ownerFid;
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
    </div>
  );
}

"use client";

import Link from "next/link";
import { useProfile } from "@farcaster/auth-kit";

// Shows a subtle "you own this" chip when the signed-in Farcaster user is the
// Capsule's owner (owner_fid match). Progressive: invisible to everyone else.
export default function OwnerBadge({ ownerFid }: { ownerFid: number | null }) {
  const { isAuthenticated, profile } = useProfile();
  if (!ownerFid || !isAuthenticated || profile?.fid !== ownerFid) return null;
  return (
    <Link
      href="/admin"
      className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent hover:border-accent"
    >
      you own this - manage
    </Link>
  );
}

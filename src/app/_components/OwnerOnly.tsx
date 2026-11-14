"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useViewer } from "@/lib/view-as";
import { canManageHearth } from "@/lib/can-manage";

// Wraps a Hearth's Manage page. The owner or an admin sees the forms; anyone else sees a
// short note instead. useViewer reads the server session (/api/auth/me), so this follows
// the same identity the save routes check. The routes stay the real gate.
export default function OwnerOnly({
  ownerFid,
  slug,
  name,
  children,
}: {
  ownerFid: number | null;
  slug: string;
  name: string;
  children: ReactNode;
}) {
  const viewer = useViewer();
  if (!viewer.ready) return <p className="mt-6 text-sm text-muted">Checking who you are...</p>;
  if (canManageHearth(viewer, ownerFid)) return <>{children}</>;
  return (
    <div className="glass mt-6 p-4 text-sm">
      <p>Only {name}&apos;s owner can manage it.</p>
      <p className="mt-2 text-muted">
        {viewer.fid === null ? (
          <>
            If this is your Hearth,{" "}
            <Link href="/profile" className="underline">
              sign in
            </Link>{" "}
            first.
          </>
        ) : (
          <>You are signed in, but this Hearth belongs to someone else.</>
        )}{" "}
        <Link href={`/c/${slug}`} className="underline">
          Back to {name}
        </Link>
      </p>
    </div>
  );
}

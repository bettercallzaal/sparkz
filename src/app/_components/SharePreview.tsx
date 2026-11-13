"use client";

import { useSyncExternalStore } from "react";
import { useViewer } from "@/lib/view-as";
import CopyButton from "./CopyButton";
import ShareButton from "./ShareButton";

// "How it looks when shared": the card a Hearth's link makes in a cast or a post
// (/api/og, the same image the Hearth page sets as its og:image), the link with a copy
// button, and the Share button (Farcaster composer with the Hearth's channel, or X).
// Owner or admin, on the Manage page.
const noopSubscribe = () => () => {};

export default function SharePreview({
  slug,
  name,
  ownerFid,
  channel,
}: {
  slug: string;
  name: string;
  ownerFid: number | null;
  channel: string | null;
}) {
  const { admin, fid } = useViewer();
  // The full link needs the browser's origin; the server render uses "" (no mismatch).
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");
  const canSee = admin || (fid !== null && ownerFid !== null && fid === ownerFid);
  if (!canSee) return null;

  const path = `/c/${slug}`;
  const link = `${origin}${path}`;

  return (
    <section className="glass mt-8 p-4">
      <h2 className="text-base font-semibold">How it looks when shared</h2>
      <p className="mt-1 text-sm text-muted">The card people see when this Hearth&apos;s link is cast or posted.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/og?slug=${encodeURIComponent(slug)}`}
        alt={`Share card for ${name}`}
        className="mt-3 aspect-[1200/630] w-full rounded-lg border border-border object-cover"
        loading="lazy"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-border px-3 py-2 text-xs text-muted">
          {link}
        </code>
        <CopyButton value={link} label="Link copied" />
      </div>
      <div className="mt-3">
        <ShareButton path={path} text={`Backing ${name} on Sparkz.`} channel={channel} />
      </div>
    </section>
  );
}

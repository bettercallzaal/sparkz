"use client";

import { useState } from "react";

// Share to Farcaster (FEF) + X. No SDK - Farcaster's compose intent and X's tweet
// intent are plain deeplinks. `path` is resolved to an absolute URL client-side so
// the shared link points at the live host (trysparkz.com in prod).
export default function ShareButton({
  path,
  text,
  className = "",
}: {
  path: string;
  text: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const url = () =>
    typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  const farcaster = () => {
    const u = url();
    const compose = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      text,
    )}&embeds[]=${encodeURIComponent(u)}`;
    window.open(compose, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const x = () => {
    const u = url();
    const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(u)}`;
    window.open(tweet, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
    } catch {
      /* clipboard may be blocked; ignore */
    }
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:border-accent"
      >
        Share
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <button
            onClick={farcaster}
            className="block w-full px-4 py-2.5 text-left text-sm hover:bg-white/5"
          >
            Cast to Farcaster
          </button>
          <button
            onClick={x}
            className="block w-full px-4 py-2.5 text-left text-sm hover:bg-white/5"
          >
            Post to X
          </button>
          <button
            onClick={copy}
            className="block w-full px-4 py-2.5 text-left text-sm hover:bg-white/5"
          >
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}

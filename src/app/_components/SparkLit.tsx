"use client";

import { useEffect, useState } from "react";
import Flame from "./Flame";

// The "moment of value" - shown once, right after a spark is created, when the create
// flow redirects to the new Capsule with ?lit=1. Onboarding research: surface the core
// value action fast and make it feel like it landed. Self-dismisses and cleans the URL
// so a refresh or share link never shows it.
export default function SparkLit() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("lit") !== "1") return;
    // Reading a one-time URL flag on mount is a genuine sync-from-external-system case,
    // and it must run after mount (not a lazy initializer) to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
    // Strip ?lit from the URL without a reload.
    params.delete("lit");
    const clean = window.location.pathname + (params.toString() ? `?${params}` : "");
    window.history.replaceState(null, "", clean);
    const t = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="toast-in mb-4 flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4">
      <Flame className="h-8 w-8 shrink-0 flame-pop" />
      <div>
        <div className="font-semibold">Your spark is lit.</div>
        <p className="text-sm text-muted">
          It is live now - share it, boost it, and run the Meme Engine when a moment lands.
        </p>
      </div>
      <button
        onClick={() => setShow(false)}
        aria-label="Dismiss"
        className="ml-auto shrink-0 text-muted hover:text-foreground"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6l-12 12" />
        </svg>
      </button>
    </div>
  );
}

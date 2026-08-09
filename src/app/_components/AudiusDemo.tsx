"use client";

import { useState } from "react";

type Track = { id: string; title: string; permalink: string; playCount: number };
type Catalog = {
  found: boolean;
  handle: string;
  name?: string;
  trackCount?: number;
  followerCount?: number;
  profileUrl?: string;
  tracks: Track[];
};

// Live proof the Audius spoke is real: type a handle, get the actual catalog from the
// Audius public API via /api/audius. No fake data - if a handle isn't found, it says so.
export default function AudiusDemo() {
  const [handle, setHandle] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [data, setData] = useState<Catalog | null>(null);

  async function look(h: string) {
    const clean = h.trim().replace(/^@/, "");
    if (!clean) return;
    setState("loading");
    setData(null);
    try {
      const r = await fetch(`/api/audius?handle=${encodeURIComponent(clean)}`);
      const j = await r.json();
      setData(j.ok ? j.data : { found: false, handle: clean, tracks: [] });
    } catch {
      setData({ found: false, handle: clean, tracks: [] });
    }
    setState("done");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">
        Try it - live from Audius
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          look(handle);
        }}
      >
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="an Audius handle, e.g. RAC"
          aria-label="Audius handle"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn-spark rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {state === "loading" ? "..." : "Look up"}
        </button>
      </form>

      {state === "done" && data && !data.found && (
        <p className="mt-4 text-sm text-muted">
          No public Audius artist found for &ldquo;{data.handle}&rdquo;. Try another handle.
        </p>
      )}

      {state === "done" && data?.found && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <a
              href={data.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground hover:text-accent"
            >
              {data.name}
            </a>
            <span className="text-xs text-muted">
              {data.trackCount ?? 0} tracks - {(data.followerCount ?? 0).toLocaleString()} followers
            </span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {data.tracks.slice(0, 5).map((t) => (
              <li key={t.id}>
                <a
                  href={t.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 text-sm text-muted hover:text-foreground"
                >
                  <span className="min-w-0 truncate">{t.title}</span>
                  <span className="shrink-0 text-xs opacity-70">
                    {t.playCount.toLocaleString()} plays
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            This is real, live data from the Audius public API - the same read that lands on a Hearth.
          </p>
        </div>
      )}
    </div>
  );
}

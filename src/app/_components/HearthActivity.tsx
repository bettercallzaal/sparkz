"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Item {
  id: string;
  hearth: { slug: string; name: string };
  kind: string;
  who: string;
  at: string;
}

// "New on your Hearths": the newest backings and boosts on the Hearths you own, newest
// first, with the ones since your last look marked new. In-app notifications without
// push (Pattern credit: Kickstarter's backings dashboard, Patreon's activity feed).
// Data: /api/me/activity, which reads the verified session, so this shows nothing
// unless you are signed in. "Last look" is kept per browser in localStorage.
const SEEN_KEY = "sparkz_activity_seen";
const SHOW = 8;

function readSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const VERB: Record<string, string> = { boost: "boosted", backing: "backed", collectable: "collected" };

export default function HearthActivity({ fid }: { fid: number | null | undefined }) {
  const [items, setItems] = useState<Item[] | null>(null);
  // Read once on first render. The list renders nothing until the fetch returns, so
  // the server render (no localStorage) and the first client render agree.
  const [seen] = useState(() => (typeof window === "undefined" ? 0 : readSeen()));

  useEffect(() => {
    if (!fid) return;
    let alive = true;
    fetch("/api/me/activity")
      .then((r) => r.json())
      .then((j) => alive && setItems(j.ok && Array.isArray(j.data) ? j.data : []))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [fid]);

  // Mark everything shown as seen for next time; this visit keeps its "new" badges.
  useEffect(() => {
    if (!items || items.length === 0) return;
    const newest = Math.max(...items.map((i) => new Date(i.at).getTime()));
    try {
      localStorage.setItem(SEEN_KEY, String(newest));
    } catch {
      // Storage blocked: every visit shows the same badges, nothing breaks.
    }
  }, [items]);

  if (!fid || !items || items.length === 0) return null;
  const fresh = items.filter((i) => new Date(i.at).getTime() > seen).length;

  return (
    <div className="mb-4 rounded-lg border border-border p-3 text-sm">
      <p className="mb-1 flex items-baseline justify-between font-medium">
        <span>New on your Hearths</span>
        {fresh > 0 && <span className="text-xs text-accent">{fresh} new</span>}
      </p>
      <ul className="divide-y divide-border">
        {items.slice(0, SHOW).map((i) => {
          const isNew = new Date(i.at).getTime() > seen;
          return (
            <li key={i.id}>
              <Link
                href={`/c/${i.hearth.slug}#backers`}
                className="flex min-h-11 items-center justify-between gap-3 py-1 active:opacity-70"
              >
                <span className="min-w-0 truncate">
                  {isNew && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />}
                  {i.who} {VERB[i.kind] ?? i.kind} <span className="font-medium">{i.hearth.name}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{ago(i.at)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

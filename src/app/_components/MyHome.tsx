"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@farcaster/auth-kit";
import Avatar from "./Avatar";

interface Row {
  slug: string;
  name: string;
  type: string;
  status: string;
  review: string | null;
  boosts?: number;
  backers?: number;
}

// "Mine" home: when you are signed in, the top of Home is your own Hearths, with a
// "needs you" strip for anything waiting on you. Pattern credit (design brief C1):
// Luma's Home tab as the hub for your own events, Kickstarter's backings dashboard
// that surfaces pending actions first.
//
// Inside the iPhone app it also sets html[data-mine], which hides the marketing
// sections below it on the home page (see the wrapper in src/app/page.tsx), so a
// signed-in user opens straight onto their own work. On the website the marketing
// page stays below this section.
export default function MyHome() {
  const { isAuthenticated, profile } = useProfile();
  const fid = isAuthenticated ? profile?.fid : undefined;
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!fid) return;
    document.documentElement.dataset.mine = "1";
    let alive = true;
    fetch(`/api/capsules/by-fid?fid=${fid}`)
      .then((r) => r.json())
      .then((j) => {
        if (alive) setRows(j.ok ? j.data : []);
      })
      .catch(() => alive && setRows([]));
    return () => {
      alive = false;
      delete document.documentElement.dataset.mine;
    };
  }, [fid]);

  if (!fid) return null;

  const pending = (rows ?? []).filter((r) => r.review === "pending");

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-6 pb-8">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">
          {profile?.username ? `Hi @${profile.username}` : "Your Hearths"}
        </h1>
        <Link
          href="/start"
          className="btn-spark inline-flex min-h-11 items-center rounded-lg px-4 text-sm"
        >
          New Hearth
        </Link>
      </div>

      {pending.length > 0 && (
        <div className="mb-4 rounded-lg border border-accent-3/40 bg-accent-3/10 p-3 text-sm">
          <p className="mb-1 font-medium">Needs you</p>
          <ul className="space-y-1">
            {pending.map((r) => (
              <li key={r.slug}>
                <Link href={`/c/${r.slug}`} className="inline-flex min-h-11 items-center underline-offset-2 hover:underline">
                  {r.name} is waiting for review
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows === null ? (
        <p className="text-sm text-muted">Loading your Hearths...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-5 text-sm">
          <p className="mb-3 text-muted">You have not lit a Hearth yet. It takes a minute.</p>
          <Link
            href="/start"
            className="btn-spark inline-flex min-h-11 items-center rounded-lg px-4 text-sm"
          >
            Light your first Hearth
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/c/${r.slug}`}
                className="glass glass-hover flex min-h-16 items-center gap-3 p-4"
              >
                <Avatar name={r.name} className="h-11 w-11 text-sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {r.type} - {r.status}
                    {typeof r.boosts === "number" ? ` - ${r.boosts} boosts` : ""}
                    {typeof r.backers === "number" ? ` - ${r.backers} backers` : ""}
                  </span>
                </span>
                {r.review === "pending" && (
                  <span className="shrink-0 rounded-full bg-accent-3/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent-3">
                    pending
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

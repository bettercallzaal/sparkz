"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";

interface Row {
  slug: string;
  name: string;
  type: string;
  status: string;
  review: string | null;
}

// Lists the Capsules a signed-in Farcaster user has created (by fid). Shown in the
// creator hub on /profile so they can jump back to anything they've sparked.
export default function YourSparks({ fid }: { fid: number }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/capsules/by-fid?fid=${fid}`)
      .then((r) => r.json())
      .then((j) => {
        if (alive && j.ok) setRows(j.data);
      })
      .catch(() => alive && setRows([]));
    return () => {
      alive = false;
    };
  }, [fid]);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-5 border-t border-border pt-5">
      <h2 className="mb-3 text-sm font-semibold">Your sparks</h2>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/c/${r.slug}`}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-accent/60"
            >
              <Avatar name={r.name} className="h-8 w-8 text-xs" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.name}</span>
              {r.review === "pending" ? (
                <span className="shrink-0 rounded-full bg-accent-3/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent-3">
                  pending review
                </span>
              ) : (
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted">
                  {r.status}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

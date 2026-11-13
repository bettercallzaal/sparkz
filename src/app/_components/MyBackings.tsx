"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";

interface Backed {
  slug: string;
  name: string;
  type: string;
  status: string;
  kinds: string[];
  last_at: string;
}

// "Hearths you back": every Hearth you have boosted or backed, newest first. Data from
// /api/me/backings (verified session only). Pattern credit: Kickstarter's "Backed
// projects", Patreon's "Memberships".
export default function MyBackings({ fid }: { fid: number | null | undefined }) {
  const [items, setItems] = useState<Backed[] | null>(null);

  useEffect(() => {
    if (!fid) return;
    let alive = true;
    fetch("/api/me/backings")
      .then((r) => r.json())
      .then((j) => alive && setItems(j.ok && Array.isArray(j.data) ? j.data : []))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [fid]);

  if (!fid || !items || items.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-medium text-muted">Hearths you back</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((b) => (
          <li key={b.slug}>
            <Link href={`/c/${b.slug}`} className="glass glass-hover flex min-h-14 items-center gap-3 p-3">
              <Avatar name={b.name} className="h-9 w-9 text-xs" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{b.name}</span>
                <span className="block truncate text-xs text-muted">
                  {b.kinds.join(" + ")} - {new Date(b.last_at).toLocaleDateString()}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

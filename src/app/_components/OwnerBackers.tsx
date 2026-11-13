"use client";

import { useEffect, useState } from "react";
import { useViewer } from "@/lib/view-as";

interface Data {
  stats: { backers: number; boosts: number; lastWeek: number };
  backers: { id: string; who: string; kind: string; at: string }[];
  capped: boolean;
}

// Backers on a Hearth's Manage page: totals and the newest 50 backers. Owner or admin
// (the route checks the same with requireHearthOwner).
export default function OwnerBackers({ hearthId, ownerFid }: { hearthId: string; ownerFid: number | null }) {
  const { admin, fid } = useViewer();
  const canSee = admin || (fid !== null && ownerFid !== null && fid === ownerFid);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    if (!canSee) return;
    let alive = true;
    fetch(`/api/capsules/backers-owner?hearth_id=${encodeURIComponent(hearthId)}`)
      .then((r) => r.json())
      .then((j) => alive && j.ok && setData(j.data as Data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [canSee, hearthId]);

  if (!canSee || !data) return null;
  const { stats } = data;
  const cell = "rounded-lg border border-border p-3 text-center";

  return (
    <section className="glass mt-8 p-4">
      <h2 className="text-base font-semibold">Backers</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className={cell}>
          <div className="text-xl font-semibold">{stats.backers}{data.capped ? "+" : ""}</div>
          <div className="text-xs text-muted">backers</div>
        </div>
        <div className={cell}>
          <div className="text-xl font-semibold">{stats.boosts}</div>
          <div className="text-xs text-muted">boosts</div>
        </div>
        <div className={cell}>
          <div className="text-xl font-semibold">{stats.lastWeek}</div>
          <div className="text-xs text-muted">last 7 days</div>
        </div>
      </div>
      {data.backers.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No backers yet. Share the Hearth to get the first.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border text-sm">
          {data.backers.map((b) => (
            <li key={b.id} className="flex min-h-11 items-center justify-between gap-3 py-1">
              <span className="min-w-0 truncate">{b.who}</span>
              <span className="shrink-0 text-xs text-muted">
                {b.kind} - {new Date(b.at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

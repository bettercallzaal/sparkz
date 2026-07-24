"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ActivityResponse, ActivityEvent } from "@/app/api/activity/route";

const DOT: Record<ActivityEvent["kind"], string> = {
  spark: "bg-accent",
  boost: "bg-accent-3",
  receipt: "bg-accent-2",
};

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ActivityStrip() {
  const [data, setData] = useState<ActivityResponse | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/activity")
        .then((r) => r.json())
        .then((j) => {
          if (alive && j.ok) setData(j.data);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 20000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!data || data.events.length === 0) return null;
  const { stats, events } = data;

  return (
    <section className="py-8">
      <div className="glass p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border pb-4">
          <Stat n={stats.sparks} label="sparks" />
          <Stat n={stats.backers} label="backers" />
          <Stat n={stats.receipts} label="receipts" />
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            live - value, not price
          </span>
        </div>

        <ul className="mt-3 space-y-2">
          {events.map((e, i) => (
            <li key={`${e.slug}-${e.at}-${i}`}>
              <Link
                href={`/c/${e.slug}`}
                className="flex items-center gap-2.5 text-sm text-muted hover:text-foreground"
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[e.kind]}`} />
                <span className="min-w-0 flex-1 truncate">{e.label}</span>
                <span className="shrink-0 text-xs text-muted opacity-70">{ago(e.at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="spark-text stat-num text-2xl font-bold">{n}</span>
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
    </span>
  );
}

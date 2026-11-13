"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Flame from "@/app/_components/Flame";
import Avatar from "@/app/_components/Avatar";
import type { DirectoryItem } from "@/app/api/directory/route";

type SortKey = "momentum" | "new" | "backers" | "boosts" | "receipts" | "name";

const TYPES = ["creator", "culture", "oss", "meme"];
const STATUSES = ["spark", "tokenized", "dormant"];
const FLAGS = [
  { key: "empire", label: "Treasury" },
  { key: "token", label: "Token" },
  { key: "farcaster", label: "Farcaster" },
  { key: "agent", label: "Agent" },
  { key: "receipts", label: "Has receipts" },
  { key: "boosts", label: "Has boosts" },
] as const;

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`min-h-11 rounded-full border px-3.5 py-1 text-sm transition-colors active:opacity-80 sm:min-h-0 sm:px-3 sm:text-xs ${
        on
          ? "border-accent bg-accent/15 text-accent"
          : "border-border bg-card text-muted hover:border-accent/50"
      }`}
    >
      {children}
    </button>
  );
}

export default function ExplorePage() {
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Set<string>>(new Set());
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("backers");
  // Phone: filters live behind one button so the list starts near the top.
  // From sm up they stay inline as before.
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/directory")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setItems(j.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (set: Set<string>, v: string, setter: (s: Set<string>) => void) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    setter(n);
  };

  const filtered = useMemo(() => {
    let out = items.filter((c) => {
      if (q && !`${c.name} ${c.slug} ${c.bio ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (types.size && !types.has(c.type)) return false;
      if (statuses.size && !statuses.has(c.status)) return false;
      // Asleep (dormant) Hearths stay out of the default view; the "dormant" chip shows them.
      if (!statuses.size && c.status === "dormant") return false;
      for (const f of flags) {
        if (f === "empire" && !c.empire) return false;
        if (f === "token" && !c.token) return false;
        if (f === "farcaster" && !c.farcaster) return false;
        if (f === "agent" && !c.agent) return false;
        if (f === "receipts" && c.receipts === 0) return false;
        if (f === "boosts" && c.boosts === 0) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "new") return b.created_at.localeCompare(a.created_at);
      if (sort === "momentum") return b.newThisWeek - a.newThisWeek;
      return (b[sort] as number) - (a[sort] as number);
    });
    return out;
  }, [items, q, types, statuses, flags, sort]);

  const clearAll = () => {
    setQ("");
    setTypes(new Set());
    setStatuses(new Set());
    setFlags(new Set());
  };
  const anyFilter = q || types.size || statuses.size || flags.size;
  const filterCount = types.size + statuses.size + flags.size;

  // "Rising": the Hearths with the most new backers this week (the same signal as the
  // Momentum sort). Shown only on the unfiltered view. Pattern credit (design brief
  // F2): a ranked "rising" row for discovery, taking none of the trading.
  const rising = useMemo(
    () =>
      [...items]
        .filter((c) => c.newThisWeek > 0)
        .sort((a, b) => b.newThisWeek - a.newThisWeek)
        .slice(0, 6),
    [items],
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-5 flex items-center gap-2">
        <Flame className="h-7 w-7 flame-live" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Explore Sparkz</h1>
          <p className="text-sm text-muted">Every ZAO Spark - filter by anything.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass mb-4 space-y-3 p-3">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, slug, bio..."
            className="min-h-11 w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-base sm:min-h-0 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="min-h-11 shrink-0 rounded-md border border-border bg-card px-3 text-sm active:bg-white/10 sm:hidden"
          >
            Filters{filterCount > 0 ? ` (${filterCount})` : ""}
          </button>
        </div>
        <div className={`${showFilters ? "flex" : "hidden"} flex-wrap gap-1.5 sm:flex`}>
          {TYPES.map((t) => (
            <Chip key={t} on={types.has(t)} onClick={() => toggle(types, t, setTypes)}>
              {t}
            </Chip>
          ))}
          <span className="mx-1 self-center text-border">|</span>
          {STATUSES.map((s) => (
            <Chip key={s} on={statuses.has(s)} onClick={() => toggle(statuses, s, setStatuses)}>
              {s}
            </Chip>
          ))}
          <span className="mx-1 self-center text-border">|</span>
          {FLAGS.map((f) => (
            <Chip key={f.key} on={flags.has(f.key)} onClick={() => toggle(flags, f.key, setFlags)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="min-h-11 rounded-md border border-border bg-card px-2 py-1 text-sm sm:min-h-0 sm:text-xs"
            >
              <option value="momentum">Momentum this week</option>
              <option value="backers">Most backers</option>
              <option value="boosts">Most boosts</option>
              <option value="receipts">Most receipts</option>
              <option value="new">Newest</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{filtered.length} of {items.length}</span>
            {anyFilter && (
              <button onClick={clearAll} className="min-h-11 px-2 text-accent hover:underline sm:min-h-0 sm:px-0">
                clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rising this week */}
      {!loading && !anyFilter && rising.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-semibold">Rising this week</h2>
          <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
            {rising.map((c) => (
              <li key={c.id} className="w-40 shrink-0 snap-start">
                <Link href={`/c/${c.slug}`} className="glass glass-hover flex h-full flex-col gap-2 p-3">
                  <Avatar name={c.name} className="h-10 w-10 text-sm" />
                  <span className="line-clamp-2 text-sm font-medium">{c.name}</span>
                  <span className="mt-auto text-[11px] font-medium text-accent-3">
                    &uarr; {c.newThisWeek} new this week
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Results */}
      {loading && (
        <ul className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="glass flex items-center gap-3 p-4">
              <div className="skeleton h-10 w-10 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-full max-w-md" />
              </div>
            </li>
          ))}
        </ul>
      )}
      <ul className={loading ? "hidden" : "space-y-2"}>
        {filtered.map((c) => (
          <li key={c.id}>
            <Link href={`/c/${c.slug}`} className="glass glass-hover block p-4">
              <div className="flex items-start gap-3">
                <Avatar name={c.name} className="h-10 w-10 text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      {c.type}
                    </span>
                    <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                      {c.status}
                    </span>
                    {c.farcaster && (
                      <span className="text-[11px] text-accent">{c.farcaster}</span>
                    )}
                    {c.newThisWeek > 0 && (
                      <span className="rounded-full border border-accent-3/40 bg-accent-3/10 px-1.5 py-0.5 text-[10px] font-medium text-accent-3">
                        &uarr; {c.newThisWeek} this week
                      </span>
                    )}
                  </div>
                  {c.bio && (
                    <p className="mt-1 line-clamp-1 text-xs text-muted">{c.bio}</p>
                  )}
                  {c.connections.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.connections.map((conn) => (
                        <span
                          key={conn.id}
                          className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent"
                        >
                          {conn.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {c.empire && <Dot title="Treasury" />}
                  {c.token && <Dot title="Token" />}
                  {c.agent && <Dot title="Agent" />}
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted">
                <span className="spark-text stat-num font-semibold">{c.backers}</span>
                <span>backers</span>
                <span className="spark-text stat-num font-semibold">{c.boosts}</span>
                <span>boosts</span>
                <span className="spark-text stat-num font-semibold">{c.receipts}</span>
                <span>receipts</span>
                {c.emails > 0 && <span>{c.emails} on list</span>}
                {c.stars != null && <span>{c.stars} stars</span>}
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-sm text-muted">
            {anyFilter ? "No sparks match those filters - try clearing some." : "No sparks yet."}
          </li>
        )}
      </ul>
    </main>
  );
}

function Dot({ title }: { title: string }) {
  return <span title={title} className="h-1.5 w-1.5 rounded-full bg-green-500" />;
}

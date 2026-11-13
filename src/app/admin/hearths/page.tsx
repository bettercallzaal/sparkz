"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/app/_components/Avatar";
import AdminSignIn from "@/app/_components/AdminSignIn";
import type { Hearth } from "@/lib/supabase/types";

// All Hearths, for an admin: every Hearth (pending, rejected, asleep and ownerless
// included) with its status, review state and owner, and the actions in one place.
// Every action goes through an existing admin- or owner-gated route:
//   approve / reject   -> /api/capsules/approve       (requireAdmin)
//   sleep / light      -> /api/capsules/update        (requireHearthOwner: admin passes)
//   make me the owner  -> /api/admin/claim-hearth     (requireAdmin, fills an empty owner)
// The list itself comes from /api/capsules?review=all (requireAdmin).

async function api<T>(url: string, body?: unknown): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const res = await fetch(url, body
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    : undefined);
  const json = await res.json().catch(() => ({}));
  return { ok: !!json.ok, status: res.status, data: json.data, error: json.error };
}

type Filter = "all" | "pending" | "rejected" | "asleep" | "no-owner";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "rejected", label: "Rejected" },
  { id: "asleep", label: "Asleep" },
  { id: "no-owner", label: "No owner" },
];

const reviewOf = (h: Hearth) => ((h.metadata ?? {}) as { review?: string }).review ?? null;

export default function AllHearths() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [list, setList] = useState<Hearth[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(() => {
    api<Hearth[]>("/api/capsules?review=all").then((r) => {
      if (r.status === 401) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      setList(r.data ?? []);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(
    () =>
      list.filter((h) => {
        if (filter === "pending") return reviewOf(h) === "pending";
        if (filter === "rejected") return reviewOf(h) === "rejected";
        if (filter === "asleep") return h.status === "dormant";
        if (filter === "no-owner") return h.owner_fid === null;
        return true;
      }),
    [list, filter],
  );

  const act = async (h: Hearth, url: string, body: unknown, done: string) => {
    setBusy(h.id);
    setNote(null);
    const r = await api(url, body);
    setNote(r.ok ? `${h.name}: ${done}` : `${h.name}: ${r.error ?? "failed"}`);
    setBusy(null);
    load();
  };

  if (authed === false) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
        <h1 className="mb-4 text-xl font-bold">All Hearths</h1>
        <AdminSignIn onSignedIn={load} />
      </main>
    );
  }

  const chip = (on: boolean) =>
    `min-h-11 rounded-full border px-3 text-sm sm:min-h-0 sm:py-1 ${on ? "border-accent bg-accent/15 text-foreground" : "border-border text-muted"}`;
  const btn = "min-h-11 rounded-md border border-border px-3 text-xs active:bg-white/10 disabled:opacity-40 sm:min-h-0 sm:py-1.5";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">
        &larr; Admin
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">All Hearths</h1>
      <p className="mt-1 text-sm text-muted">
        {authed === null ? "Loading..." : `${list.length} Hearths. Every one, including pending, rejected, asleep and ownerless.`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n =
            f.id === "all"
              ? list.length
              : list.filter((h) =>
                  f.id === "pending"
                    ? reviewOf(h) === "pending"
                    : f.id === "rejected"
                      ? reviewOf(h) === "rejected"
                      : f.id === "asleep"
                        ? h.status === "dormant"
                        : h.owner_fid === null,
                ).length;
          return (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={chip(filter === f.id)}>
              {f.label} {n}
            </button>
          );
        })}
      </div>

      {note && <p className="mt-3 text-sm text-muted">{note}</p>}

      <ul className="mt-4 space-y-2">
        {shown.map((h) => {
          const review = reviewOf(h);
          const asleep = h.status === "dormant";
          return (
            <li key={h.id} className="glass p-3">
              <div className="flex items-center gap-3">
                <Avatar name={h.name} className="h-10 w-10 text-sm" />
                <div className="min-w-0 flex-1">
                  <Link href={`/c/${h.slug}`} className="block truncate font-medium hover:underline">
                    {h.name}
                  </Link>
                  <p className="truncate text-xs text-muted">
                    {h.type} - {h.status}
                    {review ? ` - ${review}` : ""} - {h.owner_fid ? `owner fid ${h.owner_fid}` : "no owner"}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {review !== "approved" && (
                  <button type="button" disabled={busy === h.id} className={btn}
                    onClick={() => act(h, "/api/capsules/approve", { id: h.id, decision: "approve" }, "approved")}>
                    Approve
                  </button>
                )}
                {review !== "rejected" && (
                  <button type="button" disabled={busy === h.id} className={btn}
                    onClick={() => act(h, "/api/capsules/approve", { id: h.id, decision: "reject" }, "rejected")}>
                    Reject
                  </button>
                )}
                <button type="button" disabled={busy === h.id} className={btn}
                  onClick={() => act(h, "/api/capsules/update", { hearth_id: h.id, asleep: !asleep }, asleep ? "lit again" : "put to sleep")}>
                  {asleep ? "Light it again" : "Put to sleep"}
                </button>
                {h.owner_fid === null && (
                  <button type="button" disabled={busy === h.id} className={btn}
                    onClick={() => act(h, "/api/admin/claim-hearth", { slug: h.slug }, "you own it now")}>
                    Make me the owner
                  </button>
                )}
                <Link href={`/c/${h.slug}/settings`} className={`${btn} inline-flex items-center`}>
                  Manage
                </Link>
              </div>
            </li>
          );
        })}
        {authed && shown.length === 0 && (
          <li className="rounded-lg border border-dashed border-border p-5 text-sm text-muted">Nothing here.</li>
        )}
      </ul>
    </main>
  );
}

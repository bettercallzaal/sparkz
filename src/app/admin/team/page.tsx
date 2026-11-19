"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminSignIn from "@/app/_components/AdminSignIn";

export const dynamic = "force-dynamic";

type Signup = {
  id: string;
  hearth: string | null;
  name: string;
  wallet: string;
  handle: string | null;
  source: string;
  created_at: string;
};

type Filter = "apply" | "all";

// Admin only: applications to the Sparkz team (the home page form, source "apply") and
// the /zao team lists (source "zao"). The data comes from GET /api/team, which runs
// requireAdmin on the server; this page only renders what that route returns.
export default function TeamApplications() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<Filter>("apply");
  const [list, setList] = useState<Signup[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const url = filter === "apply" ? "/api/team?source=apply" : "/api/team";
    fetch(url)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        setError(null);
        if (res.status === 401) {
          setAuthed(false);
          return;
        }
        setAuthed(true);
        if (!json.ok) {
          // A failed read is shown as a failure, never as an empty list.
          setError(`Could not load (${res.status}): ${json.error ?? "try again"}`);
          setList([]);
          return;
        }
        setList((json.data ?? []) as Signup[]);
      })
      .catch(() => setError("Could not load. Check the connection and try again."));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  if (authed === false) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
        <h1 className="mb-4 text-xl font-bold">Team applications</h1>
        <AdminSignIn onSignedIn={load} />
      </main>
    );
  }

  const tab = (f: Filter, label: string) => (
    <button
      onClick={() => setFilter(f)}
      className={`rounded-md px-3 py-1.5 text-xs ${
        filter === f ? "btn-spark" : "border border-border text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Team applications</h1>
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">
          Admin -&gt;
        </Link>
      </div>
      <p className="mb-4 text-sm text-muted">
        People who applied to the Sparkz team from the home page, newest first. All
        sign-ups also shows the team lists from the /zao page.
      </p>
      <div className="mb-4 flex gap-2">
        {tab("apply", "Applications")}
        {tab("all", "All sign-ups")}
      </div>

      {authed === null && <p className="text-sm text-muted">Loading...</p>}
      {error && (
        <p role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
          {error}
        </p>
      )}
      {authed && !error && list.length === 0 && (
        <p className="rounded-lg border border-border p-6 text-center text-sm text-muted">
          No applications yet.
        </p>
      )}

      <ul className="space-y-2">
        {list.map((s) => (
          <li key={s.id} className="glass p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{s.name}</span>
              {s.handle && <span className="text-muted">@{s.handle}</span>}
              <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                {s.source}
              </span>
              {s.hearth && (
                <Link href={`/c/${s.hearth}`} className="text-xs text-muted hover:underline">
                  {s.hearth}
                </Link>
              )}
            </div>
            <div className="mt-1 break-all font-mono text-[11px] text-muted">{s.wallet}</div>
            <div className="text-[11px] text-muted">{new Date(s.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}

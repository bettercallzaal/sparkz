"use client";

import { useState } from "react";
import Link from "next/link";
import AdminSignIn from "@/app/_components/AdminSignIn";
import type { CopyReport } from "@/lib/db/copy";

// /admin/move - one-time copy of Sparkz data from Supabase to Neon (Zaal, 14 Nov 2026).
// Dry run first: it reads and counts. "Copy for real" writes to Neon, keeping every id
// and never overwriting a row already there. Remove this page after the move.

export default function MovePage() {
  const [report, setReport] = useState<CopyReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  async function run(apply: boolean) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/copy-from-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apply, withImages: true }),
      });
      if (res.status === 401) {
        setNeedsAuth(true);
        return;
      }
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "request failed");
      setReport(json.data as CopyReport);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (needsAuth) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
        <h1 className="mb-4 text-xl font-bold">Move to Neon</h1>
        <AdminSignIn onSignedIn={() => setNeedsAuth(false)} />
      </main>
    );
  }

  const btn = "min-h-11 rounded-md border border-border px-4 text-sm active:bg-white/10 disabled:opacity-40";
  const dryRunDone = report?.mode === "dry-run" && !report.stopped && report.errors.length === 0;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">
        ← Admin
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Move to Neon</h1>
      <p className="mt-1 text-sm text-muted">
        Copies every Hearth, backing, signal, receipt, team signup and waitlist row from Supabase to the new
        Neon database, and moves the pictures to Vercel Blob. Supabase is only read. Rows keep their ids and
        nothing already on Neon is overwritten, so running it twice is safe. The live site keeps using Supabase
        until SPARKZ_DB=neon is set.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className={btn} disabled={busy} onClick={() => run(false)}>
          {busy ? "Working..." : "1. Dry run (counts only)"}
        </button>
        <button className={btn} disabled={busy || !dryRunDone} onClick={() => run(true)}>
          2. Copy for real
        </button>
      </div>
      {!dryRunDone && <p className="mt-2 text-xs text-muted">Copy for real unlocks after a clean dry run.</p>}

      {err && <p className="mt-4 text-sm text-red-400">{err}</p>}

      {report && (
        <section className="glass mt-5 p-4 text-sm">
          <p className="font-medium">
            {report.mode === "dry-run" ? "Dry run: nothing was written." : "Copied."} Target: {report.target ?? "none"}
          </p>
          {report.stopped && <p className="mt-2 text-red-400">Stopped: {report.stopped}</p>}
          {report.tables.length > 0 && (
            <ul className="mt-3 space-y-1">
              {report.tables.map((t) => (
                <li key={t.table} className="flex justify-between gap-4">
                  <span>{t.table}</span>
                  <span className="text-muted">
                    {t.read} on Supabase{t.inserted !== null ? `, ${t.inserted} copied, ${t.read - t.inserted} already there` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {report.absent?.length > 0 && (
            <p className="mt-3 text-muted">
              Not on Supabase, so nothing to copy: {report.absent.join(", ")}
            </p>
          )}
          {report.images && (
            <p className="mt-3 text-muted">
              Pictures: {report.images.found} found on Supabase
              {report.mode === "apply" ? `, ${report.images.moved} moved to Blob` : ""}
            </p>
          )}
          {report.errors.length > 0 && (
            <ul className="mt-3 space-y-1 text-red-400">
              {report.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

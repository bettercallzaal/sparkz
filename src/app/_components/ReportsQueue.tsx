"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

// Open reports for the admins, on /admin/pending (migration 0009; Zaal D4: reports land
// here and nowhere else). GET /api/reports lists them; PATCH marks one reviewed (acted
// on) or dismissed. The admin removes the content itself from the Hearth's settings.
type Report = {
  id: string;
  target_type: "hearth" | "spark";
  target_id: string;
  reason: "spam" | "abuse" | "ip" | "other";
  note: string | null;
  created_at: string;
  hearth_slug: string | null;
  hearth_name: string | null;
  spark_title: string | null;
};

const REASON_LABEL: Record<Report["reason"], string> = {
  spam: "Spam",
  abuse: "Abusive or objectionable",
  ip: "Uses someone's work",
  other: "Something else",
};

export default function ReportsQueue() {
  const [list, setList] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/reports", { credentials: "include" })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!json.ok) {
          // A failed read is a failure, never "no reports".
          setError(`Reports could not be loaded (${res.status}).`);
          return;
        }
        setError(null);
        setList(json.data as Report[]);
      })
      .catch(() => setError("Reports could not be loaded."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(id: string, status: "reviewed" | "dismissed") {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.ok) setList((l) => l?.filter((r) => r.id !== id) ?? l);
      else setError(`That did not go through (${res.status}): ${json.error ?? "try again"}`);
    } catch {
      setError("That did not go through. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="mb-1 text-lg font-semibold">Reports</h2>
      <p className="mb-4 text-sm text-muted">
        Reported Hearths and Sparks, newest first. Act within 24 hours: on the Hearth&apos;s
        settings, mark the Spark cancelled or put the Hearth to sleep, then mark it reviewed.
      </p>
      {error && (
        <p role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
          {error}
        </p>
      )}
      {list === null && !error && <p className="text-sm text-muted">Loading...</p>}
      {list !== null && list.length === 0 && (
        <p className="rounded-lg border border-border p-6 text-center text-sm text-muted">
          No open reports.
        </p>
      )}
      <ul className="space-y-2">
        {(list ?? []).map((r) => (
          <li key={r.id} className="glass p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                {r.target_type}
              </span>
              {r.hearth_slug ? (
                <Link href={`/c/${r.hearth_slug}`} className="font-medium hover:underline">
                  {r.hearth_name ?? r.hearth_slug}
                </Link>
              ) : (
                <span className="font-medium">Hearth gone</span>
              )}
              {r.spark_title && <span className="text-muted">- {r.spark_title}</span>}
            </div>
            <p className="mt-1">{REASON_LABEL[r.reason] ?? r.reason}</p>
            {r.note && <p className="mt-1 text-muted">{r.note}</p>}
            <p className="mt-1 text-xs text-muted">{new Date(r.created_at).toLocaleString()}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => decide(r.id, "reviewed")}
                disabled={busy === r.id}
                className="btn-spark rounded-md px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Mark reviewed
              </button>
              <button
                onClick={() => decide(r.id, "dismissed")}
                disabled={busy === r.id}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground disabled:opacity-40"
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

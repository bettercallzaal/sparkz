"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/app/_components/Avatar";
import type { Capsule } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

async function api<T>(url: string, body?: unknown): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const res = await fetch(url, body ? {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  } : undefined);
  const json = await res.json().catch(() => ({}));
  return { ok: !!json.ok, status: res.status, data: json.data, error: json.error };
}

export default function PendingReview() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [token, setToken] = useState("");
  const [list, setList] = useState<Capsule[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await api<Capsule[]>("/api/capsules?review=pending");
    if (r.status === 401) return setAuthed(false);
    setAuthed(true);
    setList(r.data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const login = async () => {
    const r = await api("/api/admin/login", { token: token.trim() });
    if (r.ok) {
      setToken("");
      load();
    }
  };

  const decide = async (id: string, decision: "approve" | "reject") => {
    setBusy(id);
    await api("/api/capsules/approve", { id, decision });
    setList((l) => l.filter((c) => c.id !== id));
    setBusy(null);
  };

  if (authed === false) {
    return (
      <main className="mx-auto w-full max-w-sm flex-1 px-4 py-16">
        <h1 className="mb-4 text-xl font-bold">Operator - review queue</h1>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          placeholder="operator token"
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button onClick={login} className="btn-spark mt-3 w-full rounded-lg px-4 py-2.5 text-sm">
          Unlock
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Review queue</h1>
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">
          Meme Engine -&gt;
        </Link>
      </div>
      <p className="mb-5 text-sm text-muted">
        Self-serve sparks awaiting approval. Approve to list them in Explore; reject to
        keep them hidden.
      </p>

      {authed === null && <p className="text-sm text-muted">Loading...</p>}
      {authed && list.length === 0 && (
        <p className="rounded-lg border border-border p-6 text-center text-sm text-muted">
          Nothing pending. The queue is clear.
        </p>
      )}

      <ul className="space-y-2">
        {list.map((c) => {
          const meta = (c.metadata ?? {}) as { owner_email?: string };
          return (
            <li key={c.id} className="glass flex items-center gap-3 p-4">
              <Avatar name={c.name} className="h-10 w-10 text-sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/c/${c.slug}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                  <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                    {c.type}
                  </span>
                </div>
                {c.bio && <p className="line-clamp-1 text-xs text-muted">{c.bio}</p>}
                {meta.owner_email && (
                  <p className="text-[11px] text-muted">{meta.owner_email}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => decide(c.id, "approve")}
                  disabled={busy === c.id}
                  className="btn-spark rounded-md px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  Approve
                </button>
                <button
                  onClick={() => decide(c.id, "reject")}
                  disabled={busy === c.id}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

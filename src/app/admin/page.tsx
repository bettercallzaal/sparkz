"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type {
  Hearth,
  MemeReceipt,
  Signal,
  SignalDraft,
} from "@/lib/supabase/types";

type SignalWithDrafts = Signal & { drafts: SignalDraft[] };

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.ok) throw new ApiError(res.status, json.error ?? "request failed");
  return json.data as T;
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new ApiError(res.status, json.error ?? "request failed");
  return json.data as T;
}

function AdminInner() {
  const params = useSearchParams();
  const hearthParam = params.get("hearth");

  const [hearths, setHearths] = useState<Hearth[]>([]);
  const [hearthId, setHearthId] = useState<string>("");
  const [signals, setSignals] = useState<SignalWithDrafts[]>([]);
  const [receipts, setReceipts] = useState<MemeReceipt[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState("");
  // Dev-only: self-unlock so we don't paste the operator token every session. Gates
  // the first data fetch until the dev-login attempt resolves (no 401 flicker). In
  // production this flips true immediately and the normal token gate is untouched.
  const [devAuthTried, setDevAuthTried] = useState(
    process.env.NODE_ENV !== "development",
  );

  // flag form
  const [text, setText] = useState("");
  const [why, setWhy] = useState("");
  const [flaggedBy, setFlaggedBy] = useState("");

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    // Fire-and-forget: 404s in any non-dev build, so it's inert outside local dev.
    fetch("/api/admin/dev-login", { method: "POST" })
      .catch(() => {})
      .finally(() => setDevAuthTried(true));
  }, []);

  useEffect(() => {
    apiGet<Hearth[]>("/api/capsules")
      .then((c) => {
        setHearths(c);
        setHearthId(hearthParam ?? c[0]?.id ?? "");
      })
      .catch((e) => setErr(e.message));
  }, [hearthParam]);

  const refresh = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const [s, r] = await Promise.all([
        apiGet<SignalWithDrafts[]>(`/api/signals?hearth_id=${id}`),
        apiGet<MemeReceipt[]>(`/api/receipts?hearth_id=${id}`),
      ]);
      setSignals(s);
      setReceipts(r);
      setNeedsAuth(false);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 503)) {
        setNeedsAuth(true);
        return;
      }
      setErr(e instanceof Error ? e.message : "refresh failed");
    }
  }, []);

  const login = async () => {
    setBusy(true);
    setErr(null);
    try {
      await apiPost("/api/admin/login", { token });
      setToken("");
      setNeedsAuth(false);
      await refresh(hearthId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "login failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    // Intentional: re-fetch signals + receipts when the selected hearth changes.
    // refresh() owns its own state updates (the canonical data-fetch-in-effect case).
    // Wait for the dev-login attempt so the first fetch is already authed in dev.
    if (!devAuthTried) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh(hearthId);
  }, [hearthId, refresh, devAuthTried]);

  const flag = async () => {
    if (!text.trim() || !hearthId) return;
    setBusy(true);
    setErr(null);
    try {
      await apiPost("/api/signals", {
        hearth_id: hearthId,
        text: text.trim(),
        why_it_matched: why.trim() || undefined,
        flagged_by: flaggedBy.trim() || undefined,
      });
      setText("");
      setWhy("");
      await refresh(hearthId);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 503)) {
        setNeedsAuth(true);
      } else {
        setErr(e instanceof Error ? e.message : "flag failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const approve = async (signalId: string, draftId: string) => {
    setBusy(true);
    setErr(null);
    try {
      await apiPost("/api/signals/approve", {
        signal_id: signalId,
        draft_id: draftId,
        approved_via: "in_app",
        approver: flaggedBy.trim() || "admin",
      });
      await refresh(hearthId);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 503)) {
        setNeedsAuth(true);
      } else {
        setErr(e instanceof Error ? e.message : "approve failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const activeHearth = hearths.find((c) => c.id === hearthId);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          &larr; Hearths
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/add-repo"
            className="text-sm text-accent hover:text-foreground"
          >
            + Add repo
          </Link>
          <Link
            href="/admin/new"
            className="text-sm text-accent hover:text-foreground"
          >
            + New Hearth
          </Link>
          <Link
            href="/admin/empire"
            className="text-sm text-accent hover:text-foreground"
          >
            Deploy Empire
          </Link>
          <span className="text-sm font-medium">Meme Engine</span>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {err}
        </div>
      )}

      {needsAuth && (
        <section className="mb-8 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-1 text-sm font-medium">Operator unlock</h2>
          <p className="mb-3 text-xs text-muted">
            Writes are gated. Enter the operator token (SPARKZ_ADMIN_TOKEN).
          </p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && token && login()}
            placeholder="operator token"
            className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={login}
            disabled={busy || !token}
            className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {busy ? "Unlocking..." : "Unlock"}
          </button>
        </section>
      )}

      {/* How the loop works - orient a first-time operator on the pipeline + order. */}
      <ol className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-muted">
        {[
          ["1", "Flag a moment"],
          ["2", "Engine drafts 3"],
          ["3", "Approve one"],
          ["4", "Meme Receipt"],
        ].map(([n, label], i, arr) => (
          <li key={n} className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-[10px] font-medium text-foreground">
                {n}
              </span>
              {label}
            </span>
            {i < arr.length - 1 && (
              <span className="text-border" aria-hidden>
                &rarr;
              </span>
            )}
          </li>
        ))}
      </ol>

      <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
        Hearth
      </label>
      <select
        value={hearthId}
        onChange={(e) => setHearthId(e.target.value)}
        className="mb-6 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
      >
        {hearths.length === 0 && <option value="">no hearths - seed Zoostr</option>}
        {hearths.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.type})
          </option>
        ))}
      </select>

      {/* Flag a signal */}
      <section className="mb-8 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium">Flag a cultural moment</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's happening?"
          rows={2}
          className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder="Why it matches this Hearth (optional)"
          className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={flaggedBy}
          onChange={(e) => setFlaggedBy(e.target.value)}
          placeholder="Your name (approver)"
          className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={flag}
          disabled={busy || !text.trim() || !hearthId}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? "Working..." : "Flag + draft 3 responses"}
        </button>
        {activeHearth && (
          <p className="mt-2 text-xs text-muted">
            Drafts are grounded in {activeHearth.name}. Approve one to write a Meme
            Receipt.
          </p>
        )}
      </section>

      {/* Signals + drafts */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium">Signals</h2>

        {/* Loading: the flag POST runs the LLM, which takes a beat. */}
        {busy && (
          <div className="mb-4 animate-pulse rounded-lg border border-border bg-card p-4">
            <div className="mb-3 h-3 w-2/3 rounded bg-white/10" />
            <div className="space-y-2">
              <div className="h-12 rounded-md bg-white/5" />
              <div className="h-12 rounded-md bg-white/5" />
              <div className="h-12 rounded-md bg-white/5" />
            </div>
            <p className="mt-3 text-xs text-muted">Working the loop...</p>
          </div>
        )}

        {!busy && signals.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center">
            <p className="text-sm text-muted">No signals yet.</p>
            <p className="mt-1 text-xs text-muted">
              Flag a cultural moment above to draft your first 3 responses.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {signals.map((s) => {
            const isFallback = s.drafts.some((d) => d.model === "fallback");
            return (
              <li key={s.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-sm">{s.text}</p>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      s.status === "published"
                        ? "bg-accent/20 text-accent"
                        : "bg-black/40 text-muted"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                {s.why_it_matched && (
                  <p className="mb-3 text-xs text-muted">why: {s.why_it_matched}</p>
                )}

                {/* Draft-source note: make it obvious when drafts are NOT real AI. */}
                {isFallback && (
                  <p className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                    Fallback drafts (placeholder, not AI). Real drafting needs
                    OpenRouter credits - add them at openrouter.ai/settings/credits.
                  </p>
                )}

                <div className="space-y-2">
                  {s.drafts.map((d) => {
                    const fallback = d.model === "fallback";
                    return (
                      <div
                        key={d.id}
                        className={`rounded-md border p-3 text-sm ${
                          d.chosen
                            ? "border-accent bg-accent/10"
                            : "border-border bg-background"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wide text-muted">
                              Draft {d.rank}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                                fallback
                                  ? "bg-amber-500/15 text-amber-300"
                                  : "bg-emerald-500/15 text-emerald-300"
                              }`}
                              title={fallback ? "Placeholder draft" : `AI model: ${d.model}`}
                            >
                              {fallback ? "Fallback" : "AI"}
                            </span>
                            {d.chosen && (
                              <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                                Chosen
                              </span>
                            )}
                          </div>
                          {s.status !== "published" && (
                            <button
                              onClick={() => approve(s.id, d.id)}
                              disabled={busy}
                              className="rounded bg-accent px-2 py-1 text-[11px] font-medium text-white disabled:opacity-40"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                        <p>{d.draft_text}</p>
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Receipt trail */}
      <section>
        <h2 className="mb-1 text-sm font-medium">Meme Receipts (the moat)</h2>
        <p className="mb-3 text-xs text-muted">
          The permanent record of what got approved - the accumulating asset.
        </p>
        {receipts.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center">
            <p className="text-sm text-muted">No receipts yet.</p>
            <p className="mt-1 text-xs text-muted">
              Approve a draft above to write the first one.
            </p>
          </div>
        )}
        <ul className="space-y-2">
          {receipts.map((r) => (
            <li
              key={r.id}
              className="rounded-md border border-border bg-card p-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-medium text-foreground">
                  receipt {r.id.slice(0, 8)}
                </span>
                <span className="text-muted">
                  reach {r.reach} - refs {r.referrals} - backing{" "}
                  {r.backing_generated}
                </span>
              </div>
              {r.why_it_matched && (
                <p className="mt-1 text-muted">why: {r.why_it_matched}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted">
                <span>
                  approver{" "}
                  <span className="text-foreground">{r.approver || "-"}</span>
                </span>
                <span>
                  drafted by{" "}
                  <span className="text-foreground">
                    {r.creator === "fallback" ? "fallback (placeholder)" : r.creator || "-"}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading...</div>}>
      <AdminInner />
    </Suspense>
  );
}

"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type {
  Capsule,
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
  const capsuleParam = params.get("capsule");

  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [capsuleId, setCapsuleId] = useState<string>("");
  const [signals, setSignals] = useState<SignalWithDrafts[]>([]);
  const [receipts, setReceipts] = useState<MemeReceipt[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState("");

  // flag form
  const [text, setText] = useState("");
  const [why, setWhy] = useState("");
  const [flaggedBy, setFlaggedBy] = useState("");

  useEffect(() => {
    apiGet<Capsule[]>("/api/capsules")
      .then((c) => {
        setCapsules(c);
        setCapsuleId(capsuleParam ?? c[0]?.id ?? "");
      })
      .catch((e) => setErr(e.message));
  }, [capsuleParam]);

  const refresh = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const [s, r] = await Promise.all([
        apiGet<SignalWithDrafts[]>(`/api/signals?capsule_id=${id}`),
        apiGet<MemeReceipt[]>(`/api/receipts?capsule_id=${id}`),
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
      await refresh(capsuleId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "login failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    // Intentional: re-fetch signals + receipts when the selected capsule changes.
    // refresh() owns its own state updates (the canonical data-fetch-in-effect case).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh(capsuleId);
  }, [capsuleId, refresh]);

  const flag = async () => {
    if (!text.trim() || !capsuleId) return;
    setBusy(true);
    setErr(null);
    try {
      await apiPost("/api/signals", {
        capsule_id: capsuleId,
        text: text.trim(),
        why_it_matched: why.trim() || undefined,
        flagged_by: flaggedBy.trim() || undefined,
      });
      setText("");
      setWhy("");
      await refresh(capsuleId);
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
      await refresh(capsuleId);
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

  const activeCapsule = capsules.find((c) => c.id === capsuleId);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          &larr; Capsules
        </Link>
        <span className="text-sm font-medium">Meme Engine</span>
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

      <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
        Capsule
      </label>
      <select
        value={capsuleId}
        onChange={(e) => setCapsuleId(e.target.value)}
        className="mb-6 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
      >
        {capsules.length === 0 && <option value="">no capsules - seed Zoostr</option>}
        {capsules.map((c) => (
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
          placeholder="Why it matches this Capsule (optional)"
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
          disabled={busy || !text.trim() || !capsuleId}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? "Working..." : "Flag + draft 3 responses"}
        </button>
        {activeCapsule && (
          <p className="mt-2 text-xs text-muted">
            Drafts are grounded in {activeCapsule.name}. Approve one to write a Meme
            Receipt.
          </p>
        )}
      </section>

      {/* Signals + drafts */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium">Signals</h2>
        {signals.length === 0 && (
          <p className="text-sm text-muted">No signals yet.</p>
        )}
        <ul className="space-y-4">
          {signals.map((s) => (
            <li key={s.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-sm">{s.text}</p>
                <span className="shrink-0 rounded bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                  {s.status}
                </span>
              </div>
              {s.why_it_matched && (
                <p className="mb-3 text-xs text-muted">why: {s.why_it_matched}</p>
              )}
              <div className="space-y-2">
                {s.drafts.map((d) => (
                  <div
                    key={d.id}
                    className={`rounded-md border p-3 text-sm ${
                      d.chosen
                        ? "border-accent bg-accent/10"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wide text-muted">
                        Draft {d.rank} - {d.model}
                        {d.chosen ? " - CHOSEN" : ""}
                      </span>
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
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Receipt trail */}
      <section>
        <h2 className="mb-3 text-sm font-medium">Meme Receipts (the moat)</h2>
        {receipts.length === 0 && (
          <p className="text-sm text-muted">No receipts yet.</p>
        )}
        <ul className="space-y-2">
          {receipts.map((r) => (
            <li
              key={r.id}
              className="rounded-md border border-border bg-card p-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
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
              <p className="mt-1 text-muted">
                approver {r.approver ?? "-"} - creator {r.creator ?? "-"}
              </p>
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

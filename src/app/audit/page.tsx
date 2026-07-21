"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Capsule } from "@/lib/supabase/types";
import {
  GATE_LABELS,
  type GateKey,
  type GateVerdict,
  type OssCapsuleMetadata,
} from "@/lib/brand-audit/types";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.ok) throw new ApiError(res.status, json.error ?? "request failed");
  return json.data as T;
}

const GATE_ORDER: GateKey[] = [
  "earn",
  "measurable",
  "proprietary_data",
  "testable_30d",
];
const NEXT: Record<GateVerdict, GateVerdict> = {
  unknown: "pass",
  pass: "fail",
  fail: "unknown",
};
const DOT: Record<GateVerdict, string> = {
  pass: "bg-green-500",
  fail: "bg-red-500",
  unknown: "bg-zinc-600",
};

export default function AuditPage() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState("");

  const load = useCallback(async () => {
    try {
      const all = await api<Capsule[]>("/api/capsules");
      setCapsules(all.filter((c) => c.type === "oss"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "load failed");
    }
  }, []);

  useEffect(() => {
    // Intentional data-fetch-on-mount; load() owns its own state updates.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleAuth = (e: unknown) => {
    if (e instanceof ApiError && (e.status === 401 || e.status === 503)) {
      setNeedsAuth(true);
      return true;
    }
    return false;
  };

  const login = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api("/api/admin/login", { token });
      setToken("");
      setNeedsAuth(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "login failed");
    } finally {
      setBusy(false);
    }
  };

  const importRepo = async () => {
    if (!ref.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await api("/api/capsules/import-repo", { ref: ref.trim() });
      setRef("");
      await load();
    } catch (e) {
      if (!handleAuth(e)) setErr(e instanceof Error ? e.message : "import failed");
    } finally {
      setBusy(false);
    }
  };

  const cycleGate = async (c: Capsule, key: GateKey) => {
    const meta = c.metadata as OssCapsuleMetadata;
    const cur = meta.audit_result?.gates?.[key] ?? "unknown";
    try {
      await api("/api/audit", {
        capsule_id: c.id,
        gates: { [key]: NEXT[cur] },
      });
      await load();
    } catch (e) {
      if (!handleAuth(e)) setErr(e instanceof Error ? e.message : "audit failed");
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          &larr; Capsules
        </Link>
        <span className="text-sm font-medium">Brand Audit - repo -&gt; Spark</span>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {err}
        </div>
      )}

      {needsAuth && (
        <section className="mb-6 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-1 text-sm font-medium">Operator unlock</h2>
          <p className="mb-3 text-xs text-muted">Importing + auditing are gated.</p>
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

      <section className="mb-8 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium">Import a ZAO repo as a Capsule candidate</h2>
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ref.trim() && importRepo()}
          placeholder="owner/repo or github.com URL"
          className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={importRepo}
          disabled={busy || !ref.trim()}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? "Importing..." : "Import + scan"}
        </button>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">OSS Capsule candidates</h2>
        {capsules.length === 0 && (
          <p className="text-sm text-muted">None yet. Import a repo above.</p>
        )}
        <ul className="space-y-4">
          {capsules.map((c) => {
            const meta = c.metadata as OssCapsuleMetadata;
            const gates = meta.audit_result?.gates ?? {};
            return (
              <li key={c.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <a
                    href={meta.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:text-accent"
                  >
                    {meta.repo_owner}/{meta.repo_name}
                  </a>
                  <span className="text-xs text-muted">
                    {meta.stars ?? 0} stars - {meta.contributors?.length ?? 0} contributors
                  </span>
                </div>
                {c.bio && <p className="mt-1 text-sm text-muted">{c.bio}</p>}

                <div className="mt-3 space-y-1.5">
                  {GATE_ORDER.map((key) => (
                    <button
                      key={key}
                      onClick={() => cycleGate(c, key)}
                      className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-xs hover:border-accent"
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[(gates as Record<GateKey, GateVerdict>)[key] ?? "unknown"]}`}
                      />
                      <span className="flex-1">{GATE_LABELS[key]}</span>
                      <span className="text-muted">
                        {(gates as Record<GateKey, GateVerdict>)[key] ?? "unknown"}
                      </span>
                    </button>
                  ))}
                </div>
                {meta.contributors?.length > 0 && (
                  <p className="mt-3 text-xs text-muted">
                    top: {meta.contributors.slice(0, 6).map((x) => x.login).join(", ")}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

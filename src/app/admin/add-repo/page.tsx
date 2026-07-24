"use client";

import { useState } from "react";
import Link from "next/link";
import type { Capsule } from "@/lib/supabase/types";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
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

// Add a project by its GitHub repo. Step 1 of building out a Spark: paste the repo,
// we pull the real repo data and open the Capsule. Step 2 (the other info +
// integrations) is layered on from the Capsule afterward.
export default function AddRepo() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState("");
  const [result, setResult] = useState<(Capsule & { already?: boolean }) | null>(null);

  const login = async () => {
    setBusy(true);
    setErr(null);
    try {
      await apiPost("/api/admin/login", { token });
      setToken("");
      setNeedsAuth(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "login failed");
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    if (!url.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const capsule = await apiPost<Capsule & { already?: boolean }>(
        "/api/capsules/add-repo",
        { repo_url: url.trim() },
      );
      setResult(capsule);
      setUrl("");
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 503)) {
        setNeedsAuth(true);
      } else {
        setErr(e instanceof Error ? e.message : "add failed");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">
          &larr; Meme Engine
        </Link>
        <span className="text-sm font-medium">Add a project</span>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {err}
        </div>
      )}

      {needsAuth && (
        <section className="mb-6 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-1 text-sm font-medium">Operator unlock</h2>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && token && login()}
            placeholder="operator token"
            className="mb-3 mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
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

      {result ? (
        <section className="rounded-lg border border-accent/40 bg-accent/10 p-4">
          <p className="text-sm">
            {result.already ? "Already added: " : "Added "}
            <span className="font-medium">{result.name}</span> from GitHub. Now layer on the
            rest - about, links, and integrations - on the Capsule.
          </p>
          <div className="mt-3 flex gap-2 text-sm">
            <Link
              href={`/c/${result.slug}`}
              className="rounded-md bg-accent px-3 py-1.5 font-medium text-white"
            >
              View Capsule
            </Link>
            <button
              onClick={() => setResult(null)}
              className="rounded-md border border-border px-3 py-1.5 hover:border-accent"
            >
              Add another
            </button>
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <p className="text-sm text-muted">
            Paste a GitHub repo. We pull the real description, homepage, stars, language, and
            topics and open an OSS Capsule with them. Nothing is invented.
          </p>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
              GitHub repo
            </label>
            <input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && url.trim() && add()}
              placeholder="https://github.com/owner/repo  (or owner/repo)"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={add}
            disabled={busy || !url.trim()}
            className="w-full rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {busy ? "Adding..." : "Add project"}
          </button>
        </section>
      )}
    </main>
  );
}

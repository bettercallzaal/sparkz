"use client";

import { useState } from "react";
import Link from "next/link";
import type { Capsule, CapsuleType } from "@/lib/supabase/types";

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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

const TYPES: { value: CapsuleType; label: string }[] = [
  { value: "creator", label: "Creator" },
  { value: "culture", label: "Culture" },
  { value: "oss", label: "Open source" },
  { value: "meme", label: "Meme" },
];

export default function NewCapsule() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [type, setType] = useState<CapsuleType>("creator");
  const [bio, setBio] = useState("");
  const [empire, setEmpire] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState("");
  const [created, setCreated] = useState<Capsule | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(name);

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

  const create = async () => {
    if (!name.trim() || !effectiveSlug) return;
    setBusy(true);
    setErr(null);
    try {
      const capsule = await apiPost<Capsule>("/api/capsules", {
        slug: effectiveSlug,
        type,
        name: name.trim(),
        bio: bio.trim() || undefined,
        // A spark IS a non-token empire: no coin, treasury/splits come with the
        // Empire rail. Record intent so tokenization stays an explicit later step.
        economic_config: {
          empire: empire,
          tokenized: false,
          tokenization_rail: empire ? "empire" : null,
        },
      });
      setCreated(capsule);
      setName("");
      setSlug("");
      setSlugTouched(false);
      setBio("");
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 503)) {
        setNeedsAuth(true);
      } else {
        setErr(e instanceof Error ? e.message : "create failed");
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
        <span className="text-sm font-medium">New Capsule</span>
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

      {created ? (
        <section className="rounded-lg border border-accent/40 bg-accent/10 p-4">
          <p className="text-sm">
            Created <span className="font-medium">{created.name}</span> ({created.type},{" "}
            {created.status}).
          </p>
          <div className="mt-3 flex gap-2 text-sm">
            <Link
              href={`/c/${created.slug}`}
              className="rounded-md bg-accent px-3 py-1.5 font-medium text-white"
            >
              View Capsule
            </Link>
            <button
              onClick={() => setCreated(null)}
              className="rounded-md border border-border px-3 py-1.5 hover:border-accent"
            >
              Create another
            </button>
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CoC Concertz"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
              Slug
            </label>
            <input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="coc-concertz"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CapsuleType)}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="One line on what this Capsule is."
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={empire}
              onChange={(e) => setEmpire(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Non-token empire (spark now, tokenize later via the Empire rail)
          </label>

          <button
            onClick={create}
            disabled={busy || !name.trim() || !effectiveSlug}
            className="w-full rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {busy ? "Creating..." : "Create Capsule"}
          </button>
        </section>
      )}
    </main>
  );
}

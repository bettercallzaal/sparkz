"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-session-client";

// "Delete account" on Me, with one confirm step in a bottom sheet (App Store guideline
// 5.1.1(v): deletion inside the app). POST /api/account/delete does the work; when the
// person still owns an awake Hearth it answers 409 with those Hearths, and the sheet
// links each one to its Manage page so they can give it away or put it to sleep.
type Blocking = { slug: string; name: string };

export default function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<Blocking[]>([]);

  async function confirm() {
    setBusy(true);
    setError(null);
    setBlocking([]);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: "delete" }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; hearths?: Blocking[] }
        | null;
      if (res.ok && json?.ok) {
        await signOut().catch(() => undefined);
        // Reload, like Sign out on this page: auth-kit keeps its own browser state, and
        // only a reload clears it. Me then shows the signed-out Sign in screen.
        window.location.reload();
        return;
      }
      setError(json?.error ?? "Could not delete your account. Try again.");
      if (Array.isArray(json?.hearths)) setBlocking(json.hearths);
    } catch {
      setError("Could not reach Sparkz. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm text-red-400 hover:text-red-300 active:bg-white/10"
      >
        Delete account
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <button
            type="button"
            aria-label="Cancel"
            className="absolute inset-0 bg-black/70"
            onClick={() => !busy && setOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-t-2xl border-t border-border bg-card p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <h2 id="delete-account-title" className="text-base font-semibold">
              Delete your Sparkz account?
            </h2>
            <p className="mt-2 text-sm text-muted">
              This removes your boosts, your team sign-ups, the reports you filed, the people you
              blocked, and your name on any Spark you lit. Paid backings stay on the Hearth&apos;s
              record without your name. Hearths you own must be given to someone or put to
              sleep first.
              Your Farcaster account is not touched. This cannot be undone.
            </p>

            {error && (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            {blocking.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm">
                {blocking.map((h) => (
                  <li key={h.slug}>
                    <Link href={`/c/${h.slug}/settings`} className="underline">
                      {h.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={confirm}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-red-400 bg-red-950/60 px-4 text-sm font-medium text-red-200 disabled:opacity-60"
            >
              {busy ? "Deleting..." : "Delete account"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border px-4 text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

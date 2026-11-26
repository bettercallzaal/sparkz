"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Flame from "./Flame";

// Shared by the My Hearths and My Sparkz tabs: load the signed-in person's list from a
// /api/me route, and when signed out show a plain sign-in prompt with a way to keep
// browsing (App Review browses without signing in, so neither tab is a dead end).

export type MeListState<T> =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "error" }
  | { kind: "ready"; rows: T[] };

export function useMeList<T>(url: string): MeListState<T> {
  const [state, setState] = useState<MeListState<T>>({ kind: "loading" });
  useEffect(() => {
    let alive = true;
    fetch(url, { credentials: "same-origin" })
      .then(async (r) => {
        if (!alive) return;
        if (r.status === 401) return setState({ kind: "signed-out" });
        const j = await r.json();
        setState(j?.ok ? { kind: "ready", rows: j.data as T[] } : { kind: "error" });
      })
      .catch(() => alive && setState({ kind: "error" }));
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}

export function MeListHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <header className="mb-6 flex items-center gap-3">
      <Flame className="h-8 w-8" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted">{blurb}</p>
      </div>
    </header>
  );
}

export function SignInPrompt({ what }: { what: string }) {
  return (
    <section className="glass p-5 text-center" data-testid="sign-in-prompt">
      <p className="text-sm text-muted">Sign in with Farcaster to see {what}.</p>
      <Link
        href="/profile"
        className="btn-spark mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg px-5 text-sm"
      >
        Sign in
      </Link>
      <Link
        href="/explore"
        className="mt-3 inline-flex min-h-11 items-center px-3 text-sm text-muted active:text-foreground"
      >
        Look around first
      </Link>
    </section>
  );
}

export function LoadError() {
  return (
    <p className="text-sm text-muted">
      This did not load. Pull down or reopen the tab to try again.
    </p>
  );
}

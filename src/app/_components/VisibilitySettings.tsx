"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Integration = { id: string; label: string; sub: string; connected: boolean; value: string };

// Owner controls which integrations show on the public Hearth page. Admin-gated for now
// (the API checks the operator session); per-creator FID auth via SIWF is the follow-up.
export default function VisibilitySettings({
  hearthId,
  slug,
  name,
}: {
  hearthId: string;
  slug: string;
  name: string;
}) {
  const [state, setState] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/capsules/visibility?hearth_id=${hearthId}`)
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          if (alive) setState("denied");
          return;
        }
        const j = await r.json();
        if (!alive) return;
        if (j.ok) {
          setIntegrations(j.data.integrations);
          setHidden(new Set<string>(j.data.hidden));
          setState("ready");
        } else {
          setState("error");
        }
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [hearthId]);

  function toggle(id: string) {
    setSaved(false);
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const r = await fetch("/api/capsules/visibility", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hearth_id: hearthId, hidden_integrations: [...hidden] }),
      });
      const j = await r.json();
      if (j.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (state === "loading") {
    return <p className="text-sm text-muted">Loading integrations...</p>;
  }
  if (state === "denied") {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted">
        Operator access required to manage this Hearth&apos;s visibility.{" "}
        <Link href="/admin" className="text-accent hover:underline">
          Unlock the operator console
        </Link>
        , then come back. (Per-creator sign-in with your own Farcaster is coming next.)
      </div>
    );
  }
  if (state === "error") {
    return <p className="text-sm text-red-400">Could not load integrations. Try again.</p>;
  }

  return (
    <div>
      <div className="space-y-2">
        {integrations.map((i) => {
          const visible = !hidden.has(i.id);
          return (
            <div
              key={i.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${i.connected ? "bg-green-500" : "bg-muted/40"}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{i.label}</div>
                <div className="text-xs text-muted">
                  {i.sub} - {i.value}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(i.id)}
                aria-pressed={visible}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  visible
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "border border-border text-muted"
                }`}
              >
                {visible ? "Visible" : "Hidden"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-spark rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-xs text-accent">Saved - live on the public page.</span>}
        <Link href={`/c/${slug}`} className="ml-auto text-xs text-muted hover:text-foreground">
          View {name} -&gt;
        </Link>
      </div>
    </div>
  );
}

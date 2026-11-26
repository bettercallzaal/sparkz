"use client";

import { useCallback, useEffect, useState } from "react";
import type { Spark } from "@/lib/supabase/types";
import { httpsHref } from "@/lib/safe-href";
import ReportMenu from "./ReportMenu";
import TermsNote from "./TermsNote";

type Counts = { backers: number; boosts: number };

const KIND_LABEL: Record<Spark["kind"], string> = {
  moment: "Moment",
  token: "Token",
  nft: "NFT drop",
  bounty: "Bounty",
  event: "Event",
};

// Sparks on a Hearth (migration 0008): each one an event, newest first. On the Hearth page
// visitors see live and ended Sparks; with `manage` (the owner's settings page) it also shows
// planned and cancelled ones, a "Light a Spark" form and status buttons. /api/sparks checks
// owner-or-admin on every write; this only decides what to show.
export default function SparksPanel({
  slug,
  hearthId,
  counts,
  manage = false,
  ownerFid = null,
  hasOwner = false,
}: {
  slug: string;
  hearthId: string;
  counts?: Counts;
  manage?: boolean;
  // For the report and block menu on each Spark (visitors only, not on settings).
  ownerFid?: number | null;
  hasOwner?: boolean;
}) {
  const [list, setList] = useState<Spark[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/sparks?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!json.ok) {
          // A failed read is a failure, never "no Sparks yet".
          setError(`Sparks could not be loaded (${res.status}).`);
          return;
        }
        setError(null);
        setList(json.data as Spark[]);
      })
      .catch(() => setError("Sparks could not be loaded."));
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: Spark["status"]) => {
    const res = await fetch("/api/sparks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json().catch(() => ({}));
    if (json.ok) load();
    else setError(json.error ?? `Could not change it (${res.status}).`);
  };

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium">Sparks</h2>
      {manage && <LightSparkForm hearthId={hearthId} onDone={load} />}
      {error && (
        <p role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
          {error}
        </p>
      )}
      {list === null && !error && <p className="text-sm text-muted">Loading...</p>}
      {list !== null && list.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-5 text-sm text-muted">
          No Sparks yet. A Spark is an event on this Hearth: a launch moment, a drop, a bounty,
          a show.
        </p>
      )}
      <ul className="space-y-2">
        {(list ?? []).map((s) => (
          <li key={s.id} className="glass p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                {KIND_LABEL[s.kind] ?? s.kind}
              </span>
              <span className="font-medium">{s.title}</span>
              <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                {s.status}
              </span>
              {!manage && (
                <span className="ml-auto">
                  <ReportMenu
                    targetType="spark"
                    targetId={s.id}
                    hearthId={hearthId}
                    ownerFid={ownerFid}
                    hasOwner={hasOwner}
                  />
                </span>
              )}
            </div>
            {s.body && <p className="mt-2 text-muted">{s.body}</p>}
            {s.goal_metric && s.goal_target ? (
              <GoalBar metric={s.goal_metric} target={s.goal_target} counts={counts} />
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
              {s.ends_at && <span>Ends {new Date(s.ends_at).toLocaleDateString()}</span>}
              {onchainHref(s.chain_ref) && (
                <a href={onchainHref(s.chain_ref) ?? undefined} target="_blank" rel="noreferrer" className="web-only text-accent hover:underline">
                  Onchain
                </a>
              )}
              {httpsHref(s.link) && (
                <a href={httpsHref(s.link) ?? undefined} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                  Open link
                </a>
              )}
            </div>
            {manage && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(["live", "ended", "cancelled"] as const)
                  .filter((st) => st !== s.status)
                  .map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatus(s.id, st)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
                    >
                      Mark {st}
                    </button>
                  ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// "Ideally onchain things we can point to" (Zaal, 19 Nov 2026): a Spark with a contract or
// a transaction on Base links to it on the block explorer. Optional; most Sparks have none.
function onchainHref(ref: Spark["chain_ref"] | null | undefined): string | null {
  if (!ref) return null;
  if (ref.tx && /^0x[0-9a-fA-F]{64}$/.test(ref.tx)) return `https://basescan.org/tx/${ref.tx}`;
  if (ref.contract && /^0x[0-9a-fA-F]{40}$/.test(ref.contract)) return `https://basescan.org/address/${ref.contract}`;
  return null;
}

// Live progress toward a Spark's goal, from the Hearth's own counts. Shown only where those
// counts are known (the Hearth page); the settings page shows the target alone.
function GoalBar({ metric, target, counts }: { metric: string; target: number; counts?: Counts }) {
  const now = counts ? counts[metric as keyof Counts] : undefined;
  if (now === undefined) {
    return <p className="mt-2 text-xs text-muted">Goal: {target} {metric}</p>;
  }
  const pct = Math.min(100, Math.round((now / target) * 100));
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">
        {now} of {target} {metric}
      </p>
    </div>
  );
}

function LightSparkForm({ hearthId, onDone }: { hearthId: string; onDone: () => void }) {
  const [kind, setKind] = useState<Spark["kind"]>("moment");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [goal, setGoal] = useState("");
  const [onchain, setOnchain] = useState("");
  const [live, setLive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const input =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    const target = goal.trim() ? Number(goal) : null;
    const pointer = onchain.trim();
    const chain_ref = /^0x[0-9a-fA-F]{64}$/.test(pointer)
      ? { chain_id: 8453, tx: pointer }
      : /^0x[0-9a-fA-F]{40}$/.test(pointer)
        ? { chain_id: 8453, contract: pointer }
        : undefined;
    if (pointer && !chain_ref) {
      setBusy(false);
      setMsg("Onchain must be a 0x contract address or transaction hash on Base.");
      return;
    }
    const res = await fetch("/api/sparks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hearth_id: hearthId,
        kind,
        title: title.trim(),
        status: live ? "live" : "planned",
        link: link.trim() || null,
        goal_metric: target ? "backers" : null,
        goal_target: target,
        ...(chain_ref ? { chain_ref } : {}),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (json.ok) {
      setTitle("");
      setLink("");
      setGoal("");
      setOnchain("");
      onDone();
    } else setMsg(json.error ?? `Could not light it (${res.status}).`);
  };

  return (
    <div className="glass mb-4 flex flex-col gap-3 p-4">
      <div className="text-sm font-medium">Light a Spark</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Kind
          <select value={kind} onChange={(e) => setKind(e.target.value as Spark["kind"])} className={input}>
            {Object.entries(KIND_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Link (https, optional)
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
          Onchain, if any: a contract address or transaction on Base (optional)
          <input value={onchain} onChange={(e) => setOnchain(e.target.value)} placeholder="0x..." spellCheck={false} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Backer goal (optional)
          <input value={goal} onChange={(e) => setGoal(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={input} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
        Live now (untick to save it as planned, visible only to you)
      </label>
      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={busy || !title.trim()}
          className="btn-spark rounded-md px-5 py-2 text-sm disabled:opacity-40"
        >
          {busy ? "Lighting..." : "Light it"}
        </button>
        {msg && <span className="text-xs text-red-400">{msg}</span>}
      </div>
      <TermsNote action="lighting a Spark" className="text-xs text-muted" />
    </div>
  );
}

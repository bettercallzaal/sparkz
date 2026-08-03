"use client";

import { use, useEffect, useState, useCallback } from "react";

// Empire panel - renders any Empire's leaderboard + reward flow from GET /api/empire/{id}.
// The "see it on screen" surface for the Empire Builder integration: point it at a live
// empire (BizarreBeasts token today) or Zoostr's base_token once its empire is deployed.

interface Empire {
  name?: string;
  token_symbol?: string;
  token_type?: string;
  logo_uri?: string;
  treasury?: number;
  total_distributed?: number;
  total_burned?: number;
  base_token?: string;
  owner?: string;
}
interface Entry {
  rank: number;
  address: string;
  score?: number;
  boost?: number;
  farcaster_username?: string | null;
  totalRewards?: number | null;
}
interface Reward {
  amount: string;
  recipients: number;
  type: string;
}
interface Board {
  id: string;
  name?: string;
  leaderboard_type?: string;
}
interface Bundle {
  empire: { raw?: { empire?: Empire } | Empire };
  leaderboards: Board[];
  leaderboard: { entries?: Entry[] } | null;
  rewards: { empire_rewards?: Reward[] } | null;
}

function short(a: string) {
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";
}

export default function EmpirePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [empireId, setEmpireId] = useState(id);
  const [query, setQuery] = useState(id);
  const [data, setData] = useState<Bundle | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (target: string) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/empire/${encodeURIComponent(target)}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "failed to load empire");
      setData(json.data as Bundle);
    } catch (e) {
      setData(null);
      setErr(e instanceof Error ? e.message : "load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Canonical data-fetch-in-effect: load() owns its own loading/data state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(empireId);
  }, [empireId, load]);

  const rawEmpire = data?.empire?.raw;
  const e: Empire =
    (rawEmpire && "empire" in rawEmpire ? rawEmpire.empire : (rawEmpire as Empire)) ?? {};
  const entries = data?.leaderboard?.entries ?? [];
  const rewards = data?.rewards?.empire_rewards ?? [];
  const boards = data?.leaderboards ?? [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <p className="mb-1 text-xs uppercase tracking-wide text-muted">Empire Builder</p>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Empire panel</h1>

      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          if (query.trim()) setEmpireId(query.trim());
        }}
        className="mb-6 flex gap-2"
      >
        <input
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          placeholder="empire id (base_token 0x..., fid..., or slug)"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
        />
        <button
          type="submit"
          className="btn-spark rounded-md px-4 py-2 text-sm font-medium"
        >
          Load
        </button>
      </form>

      {loading && <p className="text-sm text-muted">Loading empire...</p>}
      {err && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {err}
        </div>
      )}

      {!loading && !err && data && (
        <>
          {/* Empire header */}
          <section className="mb-6 flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            {e.logo_uri && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={e.logo_uri}
                alt=""
                className="h-14 w-14 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">
                {e.name ?? "Empire"}{" "}
                {e.token_symbol && (
                  <span className="text-accent">${e.token_symbol}</span>
                )}
              </h2>
              <p className="truncate font-mono text-xs text-muted">
                {e.token_type ?? "tokenless"} - {short(e.base_token ?? empireId)}
              </p>
            </div>
          </section>

          {/* Treasury + reward summary */}
          <section className="mb-6 grid grid-cols-3 gap-2">
            {[
              ["Treasury", e.treasury != null ? `$${e.treasury.toFixed(2)}` : "-"],
              ["Distributed", e.total_distributed != null ? `$${e.total_distributed}` : "-"],
              ["Burned", e.total_burned != null ? e.total_burned.toLocaleString() : "-"],
            ].map(([label, val]) => (
              <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
                <div className="stat-num text-lg text-accent">{val}</div>
                <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
              </div>
            ))}
          </section>

          {rewards.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-medium">Reward flow</h3>
              <div className="flex flex-wrap gap-2">
                {rewards.map((r) => (
                  <div
                    key={r.type}
                    className="rounded-md border border-border bg-card px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-accent">{r.amount}</span>{" "}
                    <span className="text-muted">
                      {r.type} - {r.recipients} recipients
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Leaderboard */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Leaderboard</h3>
              {boards.length > 0 && (
                <span className="text-xs text-muted">
                  {boards[0]?.name ?? "board"} - {boards.length} board
                  {boards.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {entries.length === 0 ? (
              <p className="text-sm text-muted">No leaderboard entries.</p>
            ) : (
              <ol className="space-y-1">
                {entries.slice(0, 25).map((row) => (
                  <li
                    key={row.address + row.rank}
                    className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm"
                  >
                    <span className="w-7 shrink-0 text-center font-mono text-xs text-accent">
                      {row.rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {row.farcaster_username ? (
                        <span>@{row.farcaster_username}</span>
                      ) : (
                        <span className="font-mono text-xs text-muted">
                          {short(row.address)}
                        </span>
                      )}
                    </span>
                    {row.boost != null && row.boost > 1 && (
                      <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">
                        {row.boost}x
                      </span>
                    )}
                    <span className="stat-num shrink-0 text-xs text-muted">
                      {(row.score ?? 0).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {entries.length > 25 && (
              <p className="mt-2 text-xs text-muted">
                Showing top 25 of {entries.length}.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}

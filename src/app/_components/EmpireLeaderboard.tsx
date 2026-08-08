"use client";

import { useEffect, useState, useCallback } from "react";

// Reusable Empire leaderboard + reward-flow block. Fetches GET /api/empire/{id} and
// renders the treasury stats, the reward flow, and the ranked leaderboard. Used on the
// standalone /empire/{id} panel AND inline on a Hearth page (/c/{slug}) when the Spark
// is wired to an empire - so ZABAL / ZABAL GAMEZ show their live leaderboard on their
// own Spark page.

interface Empire {
  name?: string;
  token_symbol?: string;
  token_type?: string;
  logo_uri?: string;
  treasury?: number;
  total_distributed?: number;
  total_burned?: number;
  base_token?: string;
}
interface Entry {
  rank: number;
  address: string;
  score?: number;
  boost?: number;
  farcaster_username?: string | null;
}
interface Reward {
  amount: string;
  recipients: number;
  type: string;
}
interface Board {
  id: string;
  name?: string;
}
interface Bundle {
  empire: { raw?: { empire?: Empire } | Empire };
  leaderboards: Board[];
  leaderboard: { entries?: Entry[] } | null;
  rewards: { empire_rewards?: Reward[] } | null;
}

const short = (a: string) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "");

export default function EmpireLeaderboard({
  empireId,
  limit = 25,
  showHeader = true,
}: {
  empireId: string;
  limit?: number;
  showHeader?: boolean;
}) {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(empireId);
  }, [empireId, load]);

  if (loading) return <p className="text-sm text-muted">Loading Empire leaderboard...</p>;
  if (err)
    return (
      <p className="text-sm text-muted">Empire data unavailable ({err}).</p>
    );
  if (!data) return null;

  const raw = data.empire?.raw;
  const e: Empire = (raw && "empire" in raw ? raw.empire : (raw as Empire)) ?? {};
  const entries = data.leaderboard?.entries ?? [];
  const rewards = data.rewards?.empire_rewards ?? [];
  const boards = data.leaderboards ?? [];

  return (
    <div>
      {showHeader && (
        <div className="mb-3 flex items-center gap-3">
          {e.logo_uri && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.logo_uri} alt="" className="h-10 w-10 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {e.name}{" "}
              {e.token_symbol && <span className="text-accent">${e.token_symbol}</span>}
            </p>
            <p className="text-xs text-muted">{e.token_type ?? "tokenless"} empire</p>
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          ["Treasury", e.treasury != null ? `$${e.treasury.toFixed(2)}` : "-"],
          ["Distributed", e.total_distributed != null ? `$${e.total_distributed}` : "-"],
          ["Burned", e.total_burned != null ? e.total_burned.toLocaleString() : "-"],
        ].map(([label, val]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
            <div className="stat-num text-base text-accent">{val}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
          </div>
        ))}
      </div>

      {rewards.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {rewards.map((r) => (
            <span
              key={r.type}
              className="rounded-md border border-border bg-card px-2.5 py-1 text-xs"
            >
              <span className="font-medium text-accent">{r.amount}</span>{" "}
              <span className="text-muted">
                {r.type} - {r.recipients}
              </span>
            </span>
          ))}
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium">Leaderboard</span>
        {boards.length > 0 && (
          <span className="text-xs text-muted">
            {boards[0]?.name ?? "board"}
            {boards.length > 1 ? ` - ${boards.length} boards` : ""}
          </span>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">No leaderboard entries yet.</p>
      ) : (
        <ol className="space-y-1">
          {entries.slice(0, limit).map((row) => (
            <li
              key={row.address + row.rank}
              className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm"
            >
              <span className="w-6 shrink-0 text-center font-mono text-xs text-accent">
                {row.rank}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {row.farcaster_username ? (
                  <span>@{row.farcaster_username}</span>
                ) : (
                  <span className="font-mono text-xs text-muted">{short(row.address)}</span>
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
      {entries.length > limit && (
        <p className="mt-2 text-xs text-muted">Top {limit} of {entries.length}.</p>
      )}
    </div>
  );
}

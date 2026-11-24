"use client";

import { useCallback, useEffect, useState } from "react";
import UnblockButton from "./UnblockButton";

// Blocked creators, on Me (migration 0009). GET /api/blocks lists the identities this
// person blocked: "fid:<n>" or a wallet. A Farcaster identity shows its public name when
// the profile read works; otherwise the FID. Nothing shows while the list is empty.
type Row = { id: string; label: string };

function fallbackLabel(id: string): string {
  if (id.startsWith("fid:")) return `fid ${id.slice(4)}`;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export default function BlockedList() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/blocks", { credentials: "include" })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setRows([]);
          return;
        }
        if (!json.ok) {
          // A failed read is a failure, never "nobody blocked".
          setError("Blocked creators could not be loaded.");
          return;
        }
        const ids = json.data as string[];
        setRows(ids.map((id) => ({ id, label: fallbackLabel(id) })));
        for (const id of ids) {
          if (!id.startsWith("fid:")) continue;
          fetch(`/api/hypersnap/profile?fid=${id.slice(4)}`)
            .then((r) => r.json())
            .then((j) => {
              const name = j?.ok ? (j.data?.display ?? j.data?.username) : null;
              if (name) {
                setRows((cur) => cur?.map((r) => (r.id === id ? { ...r, label: name } : r)) ?? cur);
              }
            })
            .catch(() => {
              // The FID still shows.
            });
        }
      })
      .catch(() => setError("Blocked creators could not be loaded."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!error && (!rows || rows.length === 0)) return null;

  return (
    <div className="mt-5 border-t border-border pt-4">
      <h2 className="text-sm font-medium">Blocked creators</h2>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <ul className="mt-2 space-y-2">
        {rows?.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{r.label}</span>
            <UnblockButton
              blockedId={r.id}
              onDone={() => setRows((cur) => cur?.filter((x) => x.id !== r.id) ?? cur)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

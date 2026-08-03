"use client";

import { use, useState } from "react";
import EmpireLeaderboard from "@/app/_components/EmpireLeaderboard";

// Standalone Empire panel - a thin wrapper over the shared EmpireLeaderboard block with
// an input to jump to any empire id (base_token 0x..., fid<n>, or slug). The same block
// renders inline on a Capsule page. Point it at ZABAL / ZABAL GAMEZ / Zoostr once deployed.

export default function EmpirePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [empireId, setEmpireId] = useState(id);
  const [query, setQuery] = useState(id);

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
        <button type="submit" className="btn-spark rounded-md px-4 py-2 text-sm font-medium">
          Load
        </button>
      </form>

      <EmpireLeaderboard empireId={empireId} limit={25} showHeader />
    </main>
  );
}

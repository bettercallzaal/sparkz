"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Capsule } from "@/lib/supabase/types";
import { tokenlessCustomMessage } from "@/lib/empire/client";
import { getInjectedAddress, signMessageInjected } from "@/lib/wallet/injected";

export default function EmpirePage() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [capsuleId, setCapsuleId] = useState("");
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    fetch("/api/capsules").then((r) => r.json()).then((j) => {
      if (j.ok) { setCapsules(j.data); setCapsuleId(j.data[0]?.id ?? ""); setName(j.data[0]?.name ?? ""); }
    });
  }, []);

  const login = async () => {
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if ((await r.json()).ok) { setNeedsAuth(false); setToken(""); } else setErr("bad token");
  };
  const connect = async () => { try { setOwner(await getInjectedAddress()); } catch (e) { setErr(e instanceof Error ? e.message : "connect failed"); } };
  const deploy = async () => {
    setBusy(true); setErr(null);
    try {
      const signature = await signMessageInjected(tokenlessCustomMessage(name));
      const r = await fetch("/api/empire/deploy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ capsule_id: capsuleId, name, owner, signature }) });
      const j = await r.json();
      if (r.status === 401 || r.status === 503) { setNeedsAuth(true); return; }
      if (!j.ok) { setErr(j.error); return; }
      setResult(`Empire ${j.data.empire_id} -> treasury ${j.data.empire_address ?? "(resolving)"}`);
    } catch (e) { setErr(e instanceof Error ? e.message : "deploy failed"); } finally { setBusy(false); }
  };

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">&larr; Meme Engine</Link>
        <span className="text-sm font-medium">Deploy Empire (Base mainnet)</span>
      </div>
      {err && <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{err}</div>}
      {needsAuth && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="operator token" className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <button onClick={login} className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white">Unlock</button>
        </div>
      )}
      {result ? (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">{result}</div>
      ) : (
        <div className="space-y-3">
          <select value={capsuleId} onChange={(e) => { setCapsuleId(e.target.value); setName(capsules.find((c) => c.id === e.target.value)?.name ?? ""); }} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm">
            {capsules.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Empire name" className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm" />
          <button onClick={connect} className="w-full rounded-md border border-border px-3 py-2 text-sm hover:border-accent">{owner ? `Wallet: ${owner.slice(0, 6)}...${owner.slice(-4)}` : "Connect wallet"}</button>
          <p className="text-xs text-muted">Live on Base mainnet. 2 deploys / wallet / 24h. This is deliberate.</p>
          <button onClick={deploy} disabled={busy || !owner || !name || !capsuleId} className="w-full rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Deploying..." : "Sign + deploy empire"}</button>
        </div>
      )}
    </main>
  );
}

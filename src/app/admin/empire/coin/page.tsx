"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { base } from "viem/chains";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { Clanker } from "clanker-sdk/v4";
import type { Hearth } from "@/lib/supabase/types";
import AdminSignIn from "@/app/_components/AdminSignIn";

// Graduation: launch a Hearth's coin through Empire Builder (Clanker v4 on Base).
// 1. /api/empire/token-config: Empire builds the Clanker config (API key stays server-side).
// 2. The owner's wallet deploys it here with the Clanker SDK (the wallet pays gas).
// 3. /api/empire/register-token: Empire checks the deploy tx and creates the empire.

type Step = "idle" | "config" | "deploy" | "confirm" | "register";

const STEP_TEXT: Record<Step, string> = {
  idle: "",
  config: "Getting the launch settings from Empire...",
  deploy: "Confirm the deploy in your wallet...",
  confirm: "Waiting for Base to confirm the coin...",
  register: "Creating the empire treasury...",
};

export default function EmpireCoinPage() {
  const [hearths, setHearths] = useState<Hearth[]>([]);
  const [hearthId, setHearthId] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [logoUri, setLogoUri] = useState("");
  const [bio, setBio] = useState("");
  const [vaultPct, setVaultPct] = useState(50);
  const [vaultDays, setVaultDays] = useState(30);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [farcaster, setFarcaster] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [result, setResult] = useState<{ token: string; treasury: string | null; tx: string } | null>(null);

  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: base.id });
  const { open } = useAppKit();
  const owner = address ?? "";

  // Hearths: the admin list first (includes Hearths the public list hides, like a
  // tokenless one under review), the public list if this session is not an admin.
  // A launch link can pre-fill the form: ?hearth=<slug>&symbol=&vault=&days=&logo=
  const loadHearths = () => {
    const q = new URLSearchParams(window.location.search);
    const want = q.get("hearth");
    fetch("/api/capsules?review=all")
      .then((r) => (r.ok ? r.json() : fetch("/api/capsules").then((p2) => p2.json())))
      .then((j) => {
        if (!j.ok) return;
        const list = j.data as Hearth[];
        setHearths(list);
        const h = want ? list.find((x) => x.slug === want) : list[0];
        if (want && !h) {
          // Never fall back to another Hearth: a coin on the wrong one cannot be undone.
          setHearthId("");
          setNeedsAuth(true);
          setErr(`Hearth "${want}" is not in the list. Sign in as admin to load it.`);
          return;
        }
        setErr(null);
        setHearthId(h?.id ?? "");
        setName(q.get("name") ?? h?.name ?? "");
        // The rest of the launch link, applied once the Hearth is known.
        const sym = q.get("symbol");
        if (sym) setSymbol(sym.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12));
        const v = Number(q.get("vault"));
        if (q.has("vault") && Number.isFinite(v)) setVaultPct(Math.max(0, Math.min(90, Math.round(v))));
        const dd = Number(q.get("days"));
        if (q.has("days") && Number.isFinite(dd)) setVaultDays(Math.max(7, Math.round(dd)));
        const logo = q.get("logo");
        if (logo && logo.startsWith("https://")) setLogoUri(logo);
      });
  };

  useEffect(() => {
    loadHearths();
  }, []);

  const uploadLogo = async (file: File) => {
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (r.status === 401 || r.status === 503) {
        setNeedsAuth(true);
        return;
      }
      if (!j.ok) {
        setErr(j.error);
        return;
      }
      setLogoUri(j.data.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const post = async (path: string, body: unknown) => {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (r.status === 401 || r.status === 503) {
      setNeedsAuth(true);
      throw new Error("Sign in as the Hearth owner first");
    }
    if (!j.ok) throw new Error(j.error ?? "Request failed");
    return j.data;
  };

  const launch = async () => {
    setErr(null);
    try {
      if (!walletClient || !publicClient) throw new Error("Connect a wallet first");
      if (chainId !== base.id) await switchChainAsync({ chainId: base.id });
      const socials = {
        website_url: website.trim() || undefined,
        twitter_url: twitter.trim() || undefined,
        farcaster_url: farcaster.trim() || undefined,
      };

      setStep("config");
      const { tokenConfig } = await post("/api/empire/token-config", {
        hearth_id: hearthId,
        name: name.trim(),
        symbol: symbol.trim(),
        image_url: logoUri,
        creator: owner,
        vault_percentage: vaultPct || undefined,
        vault_days: vaultPct ? vaultDays : undefined,
        description: bio.trim() || undefined,
        ...socials,
      });

      setStep("deploy");
      const clanker = new Clanker({ wallet: walletClient, publicClient });
      const sent = await clanker.deploy(tokenConfig);
      if (sent.error) throw sent.error;

      setStep("confirm");
      const mined = await sent.waitForTransaction();
      if (mined.error) throw mined.error;

      setStep("register");
      const data = await post("/api/empire/register-token", {
        hearth_id: hearthId,
        base_token: mined.address,
        tx_hash: sent.txHash,
        owner,
        name: name.trim(),
        symbol: symbol.trim(),
        logo_uri: logoUri,
        bio: bio.trim() || undefined,
        ...socials,
      });
      setResult({ token: mined.address, treasury: data.empire_address ?? null, tx: sent.txHash });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Launch failed");
    } finally {
      setStep("idle");
    }
  };

  const busy = step !== "idle";
  const ready = owner && name.trim() && /^[A-Za-z0-9]{1,12}$/.test(symbol.trim()) && logoUri && hearthId && understood;
  const input = "w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm";
  const label = "mb-1 block text-xs uppercase tracking-wide text-muted";

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/empire" className="text-sm text-muted hover:text-foreground">
          &larr; Tokenless empire
        </Link>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Base mainnet
        </span>
      </div>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Graduate: launch a coin</h1>
        <p className="mt-1 text-sm text-muted">
          Only when the backing is real. Launches a Clanker coin on Base through Empire
          Builder and gives it an empire treasury. Your wallet signs and pays the gas.
        </p>
      </header>

      {err && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {err}
        </div>
      )}

      {needsAuth && (
        <section className="mb-6">
          <AdminSignIn
            onSignedIn={() => {
              setNeedsAuth(false);
              loadHearths();
            }}
          />
        </section>
      )}

      {result ? (
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
          <p className="mb-3 font-semibold">Coin launched</p>
          <p className="text-muted">Coin (Base)</p>
          <p className="mb-3 break-all font-mono">{result.token}</p>
          <p className="text-muted">Empire treasury</p>
          <p className="mb-4 break-all font-mono">{result.treasury ?? "resolving..."}</p>
          <div className="flex flex-wrap gap-2">
            <a href={`https://www.empirebuilder.world/empire/${result.token}`} target="_blank" rel="noreferrer" className="rounded-md bg-accent px-3 py-1.5 font-medium text-white">
              View on Empire
            </a>
            <a href={`https://basescan.org/tx/${result.tx}`} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-1.5 hover:border-accent">
              Deploy tx
            </a>
            <Link href={`/c/${hearths.find((h) => h.id === hearthId)?.slug ?? ""}`} className="rounded-md border border-border px-3 py-1.5 hover:border-accent">
              View Hearth
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={label}>Hearth</label>
            <select
              value={hearthId}
              onChange={(e) => {
                setHearthId(e.target.value);
                setName(hearths.find((h) => h.id === e.target.value)?.name ?? "");
              }}
              className={input}
            >
              {hearths.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={label}>Coin name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Symbol</label>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="IMAN"
                maxLength={12}
                className={input}
              />
            </div>
          </div>

          <div>
            <label className={label}>Image (required)</label>
            {logoUri && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUri} alt="Coin image" className="mb-2 h-16 w-16 rounded-full border border-border object-cover" />
            )}
            <label className="block cursor-pointer rounded-md border border-border bg-card px-3 py-2.5 text-center text-sm hover:border-accent">
              {uploading ? "Uploading..." : logoUri ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadLogo(f);
                }}
              />
            </label>
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className={input} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Vault % of supply</label>
              <input
                type="number"
                min={0}
                max={90}
                value={vaultPct}
                onChange={(e) => setVaultPct(Math.max(0, Math.min(90, Number(e.target.value) || 0)))}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Vault lock (days)</label>
              <input
                type="number"
                min={7}
                value={vaultDays}
                onChange={(e) => setVaultDays(Math.max(7, Number(e.target.value) || 7))}
                disabled={!vaultPct}
                className={`${input} disabled:opacity-40`}
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted">
            The vault holds this share of supply for the creator, locked for these days.
            Coins in the vault cannot go into a pool until the lock ends.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website URL" className={input} />
            <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="X URL" className={input} />
            <input value={farcaster} onChange={(e) => setFarcaster(e.target.value)} placeholder="Farcaster URL" className={input} />
          </div>

          {owner ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="font-mono">{`${owner.slice(0, 6)}...${owner.slice(-4)}`}</span>
              <button onClick={() => open()} className="ml-auto text-xs text-muted hover:text-foreground">
                change
              </button>
            </div>
          ) : (
            <button onClick={() => open()} className={`${input} hover:border-accent`}>
              Connect wallet
            </button>
          )}

          <label className="flex items-start gap-2 text-xs text-muted">
            <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-0.5" />
            This puts a real coin on Base mainnet and cannot be undone. No price or returns are promised to anyone.
          </label>

          <button
            onClick={launch}
            disabled={busy || !ready}
            className="btn-spark w-full rounded-lg px-3 py-3 text-sm disabled:opacity-40"
          >
            {busy ? STEP_TEXT[step] : "Launch coin"}
          </button>
          <p className="text-center text-xs text-muted">
            Creator gets 80% of trading fees through Empire. 2 launches per wallet per day.
          </p>
        </div>
      )}
    </main>
  );
}

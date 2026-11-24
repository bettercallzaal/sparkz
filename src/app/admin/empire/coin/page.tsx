"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { base } from "viem/chains";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { Clanker } from "clanker-sdk/v4";
import type { Hearth } from "@/lib/supabase/types";
import AdminSignIn from "@/app/_components/AdminSignIn";
import {
  BASE_CHAIN_ID,
  summarizeTokenConfig,
  tokenFromReceipt,
  type LaunchSummary,
} from "@/lib/empire/launch-summary";

// Graduation: launch a Hearth's coin through Empire Builder (Clanker v4 on Base).
// 1. Preview (the dry run): /api/empire/token-config builds the Clanker config (API key
//    stays server-side). The page shows every fee recipient, the vault and the exact
//    contract call, and simulates it on Base. Nothing is signed or sent.
// 2. Sign: the owner's wallet deploys THAT config with the Clanker SDK (wallet pays gas).
//    The tx hash is saved on the Hearth (/api/empire/token-pending) before waiting.
// 3. /api/empire/register-token: Empire checks the deploy tx and creates the empire.
// A retry after step 2 finishes the same coin; it never deploys a second one.
// ?dryrun=1 shows the preview with no sign button at all.

type Step = "idle" | "config" | "deploy" | "confirm" | "register";

const STEP_TEXT: Record<Step, string> = {
  idle: "",
  config: "Getting the launch settings from Empire...",
  deploy: "Confirm the deploy in your wallet...",
  confirm: "Waiting for Base to confirm the coin...",
  register: "Creating the empire treasury...",
};

type DeployInput = Parameters<Clanker["deploy"]>[0];

interface Preview {
  tokenConfig: unknown;
  summary: LaunchSummary;
  factory: string;
  functionName: string;
  valueWei: string;
  expectedAddress: string | null;
  simulated: string | null; // null = the simulation passed
}

interface PendingLaunch {
  tx: string;
  name: string;
  symbol: string;
  logo: string;
}

const pendingKey = (hearthId: string) => `sparkz.pendingLaunch.${hearthId}`;
const short = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a);

export default function EmpireCoinPage() {
  const [hearths, setHearths] = useState<Hearth[]>([]);
  const [hearthId, setHearthId] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [logoUri, setLogoUri] = useState("");
  const [bio, setBio] = useState("");
  const [vaultPct, setVaultPct] = useState(30);
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
  const [preview, setPreview] = useState<Preview | null>(null);
  const [sent, setSent] = useState<PendingLaunch | null>(null); // sent in this tab
  const [tick, setTick] = useState(0); // bumps when the saved launch changes
  const [dryRun, setDryRun] = useState(false);

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
        setDryRun(q.get("dryrun") === "1");
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

  // A launch already sent for this Hearth (saved on the Hearth, or in this browser):
  // the page offers to finish it and never to launch again.
  const pending = useMemo<PendingLaunch | null>(() => {
    void tick;
    const h = hearths.find((x) => x.id === hearthId);
    const econ = (h?.economic_config ?? {}) as { pending_deploy_tx?: unknown; token_address?: unknown };
    if (!hearthId || econ.token_address) return null;
    let local: PendingLaunch | null = null;
    try {
      local = typeof window === "undefined" ? null : (JSON.parse(localStorage.getItem(pendingKey(hearthId)) ?? "null") as PendingLaunch | null);
    } catch {
      local = null;
    }
    local = local ?? sent;
    const serverTx = typeof econ.pending_deploy_tx === "string" ? econ.pending_deploy_tx : null;
    const tx = serverTx ?? local?.tx ?? null;
    return tx ? { tx, name: local?.name ?? h?.name ?? "", symbol: local?.symbol ?? "", logo: local?.logo ?? "" } : null;
  }, [hearthId, hearths, sent, tick]);

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
      setPreview(null);
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

  const socials = () => ({
    website_url: website.trim() || undefined,
    twitter_url: twitter.trim() || undefined,
    farcaster_url: farcaster.trim() || undefined,
  });

  // The dry run: everything the wallet would be asked to sign, and nothing sent.
  const runPreview = async () => {
    setErr(null);
    setPreview(null);
    setUnderstood(false);
    try {
      if (!walletClient || !publicClient || !owner) throw new Error("Connect a wallet first");
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
        ...socials(),
      });
      const summary = summarizeTokenConfig(tokenConfig, { creator: owner });
      const clanker = new Clanker({ wallet: walletClient, publicClient });
      const tx = await clanker.getDeployTransaction(tokenConfig as DeployInput);
      const sim = await clanker.deploySimulate(tokenConfig as DeployInput, walletClient.account);
      setPreview({
        tokenConfig,
        summary,
        factory: tx.address,
        functionName: String(tx.functionName),
        valueWei: (tx.value ?? BigInt(0)).toString(),
        expectedAddress: tx.expectedAddress ?? null,
        simulated: sim.error ? sim.error.message : null,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setStep("idle");
    }
  };

  const register = async (tx: string, token: string, p: { name: string; symbol: string; logo: string }) => {
    setStep("register");
    const data = await post("/api/empire/register-token", {
      hearth_id: hearthId,
      base_token: token,
      tx_hash: tx,
      owner,
      name: p.name,
      symbol: p.symbol,
      logo_uri: p.logo || undefined,
      bio: bio.trim() || undefined,
      ...socials(),
    });
    localStorage.removeItem(pendingKey(hearthId));
    setSent(null);
    setTick((t) => t + 1);
    setHearths((list) =>
      list.map((h) => (h.id === hearthId ? { ...h, economic_config: { ...h.economic_config, token_address: token } } : h)),
    );
    setResult({ token, treasury: data.empire_address ?? null, tx });
  };

  // Signs exactly the config shown in the preview. No second fetch, so no second coin.
  const sign = async () => {
    setErr(null);
    if (!preview || preview.summary.problems.length > 0 || preview.simulated || dryRun || pending) return;
    try {
      if (!walletClient || !publicClient) throw new Error("Connect a wallet first");
      if (chainId !== base.id) await switchChainAsync({ chainId: base.id });

      setStep("deploy");
      const clanker = new Clanker({ wallet: walletClient, publicClient });
      const sent = await clanker.deploy(preview.tokenConfig as DeployInput);
      if (sent.error) throw sent.error;

      // Saved before anything else can fail, so a retry finishes this coin.
      const p = { tx: sent.txHash, name: name.trim(), symbol: symbol.trim(), logo: logoUri };
      localStorage.setItem(pendingKey(hearthId), JSON.stringify(p));
      setSent(p);
      await post("/api/empire/token-pending", { hearth_id: hearthId, tx_hash: sent.txHash }).catch(() => null);

      setStep("confirm");
      const mined = await sent.waitForTransaction();
      if (mined.error) throw mined.error;
      setPreview(null);
      await register(sent.txHash, mined.address, p);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Launch failed");
    } finally {
      setStep("idle");
    }
  };

  // Resume a launch whose deploy tx was already sent.
  const finish = async () => {
    if (!pending || !publicClient) return;
    setErr(null);
    try {
      setStep("confirm");
      const receipt = await publicClient.waitForTransactionReceipt({ hash: pending.tx as `0x${string}` });
      if (receipt.status !== "success") {
        throw new Error("That deploy failed on Base, so no coin exists. Ask the operator to clear it.");
      }
      const token = tokenFromReceipt(receipt.logs);
      if (!token) throw new Error("Could not find the coin in that transaction");
      await register(pending.tx, token, {
        name: pending.name || name.trim(),
        symbol: pending.symbol || symbol.trim(),
        logo: pending.logo || logoUri,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Finishing the launch failed");
    } finally {
      setStep("idle");
    }
  };

  const busy = step !== "idle";
  const ready = owner && name.trim() && /^[A-Za-z0-9]{1,12}$/.test(symbol.trim()) && logoUri && hearthId;
  const canSign = Boolean(
    ready && understood && preview && !preview.simulated && preview.summary.problems.length === 0 && !dryRun && !pending,
  );
  const input = "w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm";
  const label = "mb-1 block text-xs uppercase tracking-wide text-muted";
  // Any edit after a preview throws the preview away, so what is signed is what was read.
  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPreview(null);
  };

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
          Optional. The Hearth works without a coin and nobody has to buy anything to join.
          Only when the backing is real: this launches a Clanker coin on Base through Empire
          Builder and gives it an empire treasury. Your wallet signs and pays the gas.
        </p>
        {dryRun && (
          <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-200">
            Dry run. This page shows everything a launch would sign and sends nothing.
          </p>
        )}
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

      {pending && !result && (
        <section className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="mb-1 font-semibold">A launch was already sent for this Hearth</p>
          <p className="mb-3 text-muted">Finish it here. A new launch is blocked so a second coin is never made.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={finish} disabled={busy || !owner} className="btn-spark rounded-md px-3 py-1.5 disabled:opacity-40">
              {busy ? STEP_TEXT[step] : "Finish launch"}
            </button>
            <a
              href={`https://basescan.org/tx/${pending.tx}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border px-3 py-1.5 hover:border-accent"
            >
              Deploy tx
            </a>
          </div>
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
                setPreview(null);
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
              <input value={name} onChange={(e) => edit(setName)(e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Symbol</label>
              <input
                value={symbol}
                onChange={(e) => edit(setSymbol)(e.target.value.toUpperCase())}
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
            <textarea value={bio} onChange={(e) => edit(setBio)(e.target.value)} rows={2} className={input} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Vault % of supply</label>
              <input
                type="number"
                min={0}
                max={90}
                value={vaultPct}
                onChange={(e) => edit(setVaultPct)(Math.max(0, Math.min(90, Number(e.target.value) || 0)))}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Vault lock (days)</label>
              <input
                type="number"
                min={7}
                value={vaultDays}
                onChange={(e) => edit(setVaultDays)(Math.max(7, Number(e.target.value) || 7))}
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
            <input value={website} onChange={(e) => edit(setWebsite)(e.target.value)} placeholder="Website URL" className={input} />
            <input value={twitter} onChange={(e) => edit(setTwitter)(e.target.value)} placeholder="X URL" className={input} />
            <input value={farcaster} onChange={(e) => edit(setFarcaster)(e.target.value)} placeholder="Farcaster URL" className={input} />
          </div>

          {owner ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="font-mono">{short(owner)}</span>
              <button onClick={() => open()} className="ml-auto text-xs text-muted hover:text-foreground">
                change
              </button>
            </div>
          ) : (
            <button onClick={() => open()} className={`${input} hover:border-accent`}>
              Connect wallet
            </button>
          )}

          <button
            onClick={runPreview}
            disabled={busy || !ready || Boolean(pending)}
            className="w-full rounded-lg border border-border bg-card px-3 py-3 text-sm hover:border-accent disabled:opacity-40"
          >
            {busy && step === "config" ? STEP_TEXT[step] : preview ? "Preview again" : "Preview launch (sends nothing)"}
          </button>

          {preview && <LaunchReview p={preview} owner={owner} />}

          {preview && !dryRun && (
            <>
              <label className="flex items-start gap-2 text-xs text-muted">
                <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-0.5" />
                I checked every line above. This puts a real coin on Base mainnet and cannot be undone. No price or returns are promised to anyone.
              </label>
              <button
                onClick={sign}
                disabled={busy || !canSign}
                className="btn-spark w-full rounded-lg px-3 py-3 text-sm disabled:opacity-40"
              >
                {busy && step !== "config" ? STEP_TEXT[step] : "Sign and launch"}
              </button>
            </>
          )}
          <p className="text-center text-xs text-muted">2 launches per wallet per day (Empire limit).</p>
        </div>
      )}
    </main>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/50 py-1.5 last:border-0">
      <span className="text-muted">{k}</span>
      <span className={`text-right ${mono ? "break-all font-mono text-xs" : ""}`}>{v}</span>
    </div>
  );
}

// Everything the wallet is about to sign, read from the config itself.
function LaunchReview({ p, owner }: { p: Preview; owner: string }) {
  const s = p.summary;
  const me = owner.toLowerCase();
  const who = (addr: string, bps: number) =>
    addr.toLowerCase() === me ? "You" : bps === 2000 ? "Empire Builder" : "Unknown";
  const vault = s.vaultPct
    ? `${s.vaultPct}% of supply to you, locked ${s.vaultLockDays} days${s.vaultVestDays ? `, then vests over ${s.vaultVestDays} days` : ""}`
    : "None";
  return (
    <section className="rounded-xl border border-border bg-card p-4 text-sm">
      <p className="mb-2 font-semibold">What you will sign</p>
      <Row k="Chain" v={`Base mainnet (${BASE_CHAIN_ID})`} />
      <Row k="Contract" v={`Clanker v4 factory ${p.factory}`} mono />
      <Row k="Call" v={p.functionName} mono />
      <Row k="ETH sent with it" v={p.valueWei === "0" ? "0, gas only" : `${p.valueWei} wei`} />
      {p.expectedAddress && <Row k="Coin address" v={p.expectedAddress} mono />}
      <Row k="Name and symbol" v={`${s.name} (${s.symbol})`} />
      <Row k="Supply" v={`${s.supply.toLocaleString("en-US")}, fixed, minted once`} />
      <Row k="Coin admin" v={short(s.tokenAdmin)} mono />
      <Row k="Vault" v={vault} />
      <Row k="Rest of supply" v={`${100 - s.vaultPct}% into the Uniswap v4 pool`} />
      <Row k="Swap fee" v={s.feeText} />
      <Row k="Sniper fee at launch" v={s.sniperFees ? "On: high for the first seconds, then it drops" : "Off"} />
      <Row k="Coins bought at launch" v={s.devBuy ? "Yes" : "None"} />

      <p className="mb-1 mt-4 font-semibold">Who gets the trading fees</p>
      <Row k="Clanker protocol (fixed on-chain)" v={`${s.clankerPct}%`} />
      {s.recipients.map((r) => (
        <Row key={r.recipient + r.bps} k={`${who(r.recipient, r.bps)} ${short(r.recipient)}`} v={`${r.pctOfTradingFees}%`} />
      ))}
      <p className="mt-2 text-xs text-muted">
        Shares of every swap fee. Clanker takes its {s.clankerPct}% first and the recipients above split the rest.
      </p>

      <p className="mb-1 mt-4 font-semibold">Can it be undone?</p>
      <p className="text-xs text-muted">
        No. The coin, its supply, the pool and the locked liquidity are permanent. Later the
        coin admin can change only the image and description, and each fee recipient&apos;s
        admin can point that share at a new address.
      </p>

      {(s.problems.length > 0 || p.simulated) && (
        <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          <p className="mb-1 font-semibold">Launch blocked</p>
          {s.problems.map((x) => (
            <p key={x}>{x}</p>
          ))}
          {p.simulated && <p>Simulation on Base failed: {p.simulated}</p>}
        </div>
      )}
      {s.problems.length === 0 && !p.simulated && (
        <p className="mt-4 text-xs text-green-400">Simulated on Base: this exact call would succeed.</p>
      )}
    </section>
  );
}

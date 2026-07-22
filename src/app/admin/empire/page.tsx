"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Capsule } from "@/lib/supabase/types";
import { tokenlessCustomMessage } from "@/lib/empire/client";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useSignMessage } from "wagmi";

function Flame({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="fl" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="0.55" stopColor="#ec4899" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        fill="url(#fl)"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
      />
    </svg>
  );
}

export default function EmpirePage() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [capsuleId, setCapsuleId] = useState("");
  const [name, setName] = useState("");
  const { address } = useAccount();
  const { open } = useAppKit();
  const { signMessageAsync } = useSignMessage();
  const owner = address ?? "";
  const [result, setResult] = useState<{ id: string; treasury: string | null } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [logoUri, setLogoUri] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/capsules")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setCapsules(j.data);
          setCapsuleId(j.data[0]?.id ?? "");
          setName(j.data[0]?.name ?? "");
        }
      });
  }, []);

  const login = async () => {
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if ((await r.json()).ok) {
      setNeedsAuth(false);
      setToken("");
      setErr(null);
    } else setErr("Invalid operator token");
  };

  const walletConfigured = Boolean(process.env.NEXT_PUBLIC_REOWN_PROJECT_ID);

  const connect = () => {
    setErr(null);
    if (!walletConfigured) {
      setErr(
        "Wallet connect isn't configured yet - set NEXT_PUBLIC_REOWN_PROJECT_ID.",
      );
      return;
    }
    open();
  };

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

  const deploy = async () => {
    setBusy(true);
    setErr(null);
    try {
      const signature = await signMessageAsync({
        message: tokenlessCustomMessage(name),
      });
      const r = await fetch("/api/empire/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capsule_id: capsuleId,
          name,
          owner,
          signature,
          logo_uri: logoUri || undefined,
          bio: bio.trim() || undefined,
          website_url: website.trim() || undefined,
          twitter_url: twitter.trim() || undefined,
          telegram_url: telegram.trim() || undefined,
        }),
      });
      const j = await r.json();
      if (r.status === 401 || r.status === 503) {
        setNeedsAuth(true);
        return;
      }
      if (!j.ok) {
        setErr(j.error);
        return;
      }
      setResult({ id: j.data.empire_id, treasury: j.data.empire_address ?? null });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Deploy failed");
    } finally {
      setBusy(false);
    }
  };

  const short = owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : "";

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">
          &larr; Meme Engine
        </Link>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Base mainnet
        </span>
      </div>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Launch a tokenless empire</h1>
        <p className="mt-1 text-sm text-muted">
          Give a Capsule a create2 treasury on Base. No coin, nothing on-chain until
          the first interaction - the durable home momentum accrues to.
        </p>
      </header>

      {err && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {err}
        </div>
      )}

      {needsAuth && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-sm font-medium">Operator unlock</p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && token && login()}
            placeholder="operator token"
            className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={login}
            className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white"
          >
            Unlock
          </button>
        </div>
      )}

      {result ? (
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-6 w-6" />
            <span className="font-semibold">Empire deployed</span>
          </div>
          <p className="text-sm text-muted">Empire ID</p>
          <p className="mb-3 break-all font-mono text-sm">{result.id}</p>
          <p className="text-sm text-muted">SmartVault treasury (Base)</p>
          <p className="break-all font-mono text-sm">
            {result.treasury ?? "resolving..."}
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href={`https://www.empirebuilder.world/empire/${result.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white"
            >
              View on Empire
            </a>
            <Link
              href={`/c/${capsules.find((c) => c.id === capsuleId)?.slug ?? ""}`}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-accent"
            >
              View Capsule
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Preview - what you're minting */}
          <div className="mb-5 overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border p-4">
              {logoUri ? (
                <div
                  className="h-11 w-11 shrink-0 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${logoUri})` }}
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black/40">
                  <Flame className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold">{name || "Your Capsule"}</div>
                <div className="text-xs text-muted">Tokenless empire - Base</div>
              </div>
              <span className="ml-auto rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                Spark
              </span>
            </div>
            <div className="p-4 text-xs text-muted">
              A predictable treasury address is reserved now. Attach a Clanker token
              later, only if it makes sense.
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
                Capsule
              </label>
              <select
                value={capsuleId}
                onChange={(e) => {
                  setCapsuleId(e.target.value);
                  setName(capsules.find((c) => c.id === e.target.value)?.name ?? "");
                }}
                className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm"
              >
                {capsules.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
                Empire name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Empire name"
                className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
                Logo (optional)
              </label>
              <div className="flex items-center gap-3">
                {logoUri && (
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${logoUri})` }}
                  />
                )}
                <label className="flex-1 cursor-pointer rounded-md border border-border bg-card px-3 py-2.5 text-center text-sm hover:border-accent">
                  {uploading ? "Uploading..." : logoUri ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadLogo(f);
                    }}
                  />
                </label>
                {logoUri && (
                  <button
                    onClick={() => setLogoUri("")}
                    className="text-xs text-muted hover:text-foreground"
                  >
                    remove
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
                Description (optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="One line on what this empire is."
                className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm"
              />
            </div>

            {/* Socials */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website URL"
                className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm"
              />
              <input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="X URL"
                className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm"
              />
              <input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="Telegram URL"
                className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
                Owner wallet
              </label>
              {owner ? (
                <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="font-mono">{short}</span>
                  <button
                    onClick={connect}
                    className="ml-auto text-xs text-muted hover:text-foreground"
                  >
                    change
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm hover:border-accent"
                >
                  Connect wallet
                </button>
              )}
            </div>

            {owner && name && (
              <div className="rounded-md border border-border bg-background p-3">
                <p className="mb-1 text-[10px] uppercase tracking-wide text-muted">
                  You will sign
                </p>
                <p className="break-all font-mono text-xs text-foreground">
                  {tokenlessCustomMessage(name)}
                </p>
              </div>
            )}

            <button
              onClick={deploy}
              disabled={busy || !owner || !name || !capsuleId}
              className="btn-spark w-full rounded-lg px-3 py-3 text-sm disabled:opacity-40"
            >
              {busy ? "Deploying..." : "Sign + launch empire"}
            </button>

            <p className="text-center text-xs text-muted">
              Live on Base mainnet - no gas to sign - 2 launches / wallet / 24h.
            </p>
          </div>
        </>
      )}
    </main>
  );
}

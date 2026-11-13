"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import WalletProviders from "@/app/admin/empire/providers";
import { hex, keyAdd, keyRemoveSelf, type Signer, type TypedData } from "@/lib/hypersnap-proto";
import { dropSigner, newSigner, signerFor } from "@/lib/hypersnap-vault";

// "Sparkz can post for you on Hypersnap": on/off. On makes an Ed25519 key in this browser
// (never sent anywhere), has the custody wallet sign a gasless KEY_ADD, relays it to the
// node and waits until the node lists the key. Off sends a self-signed KEY_REMOVE and
// drops the key. Nothing is posted in this PR; the key is what PR 3 signs Sparks with.
type State =
  | { kind: "checking" }
  | { kind: "off" }
  | { kind: "on"; pub: string; since: number }
  | { kind: "pending"; pub: string }
  | { kind: "working"; step: string }
  | { kind: "error"; message: string; pub?: string };

const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

async function listed(fid: number, pub: string): Promise<boolean> {
  const r = await fetch(`/api/hypersnap/signer?fid=${fid}&signer=0x${pub}`, { cache: "no-store" });
  if (!r.ok) return false;
  const j = (await r.json()) as { ok: boolean; data?: { listed: boolean } };
  return Boolean(j.ok && j.data?.listed);
}

async function submit(msg: Uint8Array): Promise<void> {
  const r = await fetch("/api/hypersnap/submit", {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body: msg as BodyInit,
  });
  const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!r.ok || !j?.ok) throw new Error(j?.error ?? `submit failed (${r.status})`);
}

function Inner({ fid, custody }: { fid: number; custody: string | null }) {
  const [state, setState] = useState<State>({ kind: "checking" });
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const { open } = useAppKit();

  const refresh = useCallback(async () => {
    try {
      const s = await signerFor(fid);
      if (!s) return setState({ kind: "off" });
      const pub = hex(s.pub);
      setState((await listed(fid, pub)) ? { kind: "on", pub, since: s.at } : { kind: "pending", pub });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "could not read this browser's key" });
    }
  }, [fid]);

  // the vault and the node are external systems: read them once the component is up
  useEffect(() => {
    const t = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(t);
  }, [refresh]);

  const custodyConnected = Boolean(custody && address && address.toLowerCase() === custody.toLowerCase());

  async function turnOn() {
    if (!custody) return setState({ kind: "error", message: "your Farcaster custody address is not known here; sign in again" });
    if (!isConnected) return open();
    if (!custodyConnected) {
      return setState({
        kind: "error",
        message: `connect the wallet that holds your Farcaster account (custody ${short(custody)}), not ${short(address ?? "")}. An account made in Warpcast keeps that wallet inside the Warpcast app.`,
      });
    }
    try {
      setState({ kind: "working", step: "making a key in this browser" });
      const signer: Signer = await newSigner(fid);
      const pub = hex(signer.pub);
      setState({ kind: "working", step: "two signatures from your wallet" });
      const wallet = {
        address: custody,
        signTyped: (t: TypedData) =>
          signTypedDataAsync({ domain: t.domain, types: t.types, primaryType: t.primaryType, message: t.message } as Parameters<typeof signTypedDataAsync>[0]),
      };
      const { msg } = await keyAdd(fid, wallet, signer, Math.floor(Date.now() / 1000));
      setState({ kind: "working", step: "sending the key to the node" });
      await submit(msg);
      setState({ kind: "working", step: "waiting for the node to list it" });
      for (let i = 0; i < 10; i++) {
        if (await listed(fid, pub)) return setState({ kind: "on", pub, since: Date.now() });
        await new Promise((r) => setTimeout(r, 2000));
      }
      setState({ kind: "pending", pub });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "could not turn on" });
    }
  }

  async function turnOff() {
    try {
      const signer = await signerFor(fid);
      if (signer) {
        setState({ kind: "working", step: "removing the key from the node" });
        const { msg } = await keyRemoveSelf(fid, signer, Math.floor(Date.now() / 1000));
        await submit(msg).catch(() => { /* a key the node never listed has nothing to remove */ });
      }
      await dropSigner(fid);
      setState({ kind: "off" });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "could not turn off" });
    }
  }

  return (
    <section className="glass mt-5 p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Post on Hypersnap</div>
          <p className="mt-1 text-xs text-muted">
            Lets Sparkz sign casts and likes for you with a key that lives in this browser only.
            Gasless. Turn it off any time.
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs ${state.kind === "on" ? "bg-accent/20 text-accent" : "bg-white/5 text-muted"}`}>
          {state.kind === "on" ? "on" : state.kind === "pending" ? "pending" : state.kind === "working" || state.kind === "checking" ? "..." : "off"}
        </span>
      </div>

      {state.kind === "on" && (
        <p className="mt-3 text-xs text-muted">
          key <span className="font-mono text-foreground">{short(state.pub)}</span>, since {new Date(state.since).toLocaleDateString()}
        </p>
      )}
      {state.kind === "pending" && (
        <p className="mt-3 text-xs text-muted">
          this browser holds a key (<span className="font-mono">{short(state.pub)}</span>) the node does not list yet. Give it a minute and refresh, or turn it off and on again.
        </p>
      )}
      {state.kind === "working" && <p className="mt-3 text-xs text-muted">{state.step}...</p>}
      {state.kind === "error" && <p className="mt-3 text-xs text-red-400">{state.message}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {(state.kind === "off" || state.kind === "error") && (
          <button type="button" onClick={turnOn} className="btn-spark min-h-11 rounded-lg px-4 text-sm font-semibold">
            {isConnected ? (custodyConnected ? "Turn on" : "Turn on (connect custody wallet)") : "Connect wallet to turn on"}
          </button>
        )}
        {(state.kind === "on" || state.kind === "pending" || state.kind === "error") && (
          <button type="button" onClick={turnOff} className="min-h-11 rounded-lg border border-white/10 px-4 text-sm text-muted hover:text-foreground">
            Turn off
          </button>
        )}
        {state.kind === "pending" && (
          <button type="button" onClick={() => void refresh()} className="min-h-11 rounded-lg border border-white/10 px-4 text-sm text-muted hover:text-foreground">
            Check again
          </button>
        )}
      </div>
      {isConnected && address && (
        <p className="mt-3 text-xs text-muted">
          wallet <span className="font-mono text-foreground">{short(address)}</span>
          {custody && !custodyConnected ? " (not the custody wallet)" : ""}
        </p>
      )}
    </section>
  );
}

export default function HypersnapSigner(props: { fid: number; custody: string | null }) {
  return (
    <WalletProviders>
      <Inner {...props} />
    </WalletProviders>
  );
}

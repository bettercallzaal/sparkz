"use client";

import { useState } from "react";
import { useToast } from "./toast";

type Spark = { slug: string; name: string };

// "Join the team" for The ZAO's Sparks: pick a Spark, give a name and a wallet, done.
// No wallet connect, no signature: the address is typed, the route validates it and
// writes one row per wallet per Spark (see /api/team).
export default function JoinTeamForm({ sparks }: { sparks: Spark[] }) {
  const toast = useToast();
  const [slug, setSlug] = useState(sparks[0]?.slug ?? "");
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [handle, setHandle] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const walletOk = /^0x[0-9a-fA-F]{40}$/.test(wallet.trim());
  const ready = slug && name.trim() && walletOk;

  const join = async () => {
    if (!ready) return;
    setState("busy");
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: name.trim(),
          wallet: wallet.trim(),
          handle: handle.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setState("done");
        toast("You're on the team list.", "success");
      } else {
        setState("error");
        toast(json.error ?? "Could not join. Try again.", "error");
      }
    } catch {
      setState("error");
      toast("Could not join. Try again.", "error");
    }
  };

  if (state === "done") {
    const spark = sparks.find((s) => s.slug === slug)?.name ?? "the Spark";
    return (
      <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
        You are on the {spark} team list. The wallet you gave is the one that counts when
        the Spark graduates.
      </div>
    );
  }

  const input =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Spark
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className={input}>
            {sparks.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Name (required)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="your name or handle"
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
          Wallet (0x address on Base)
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x..."
            spellCheck={false}
            className={input}
          />
          {wallet && !walletOk && (
            <span className="text-red-400">that is not a 0x address</span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
          Farcaster or X handle (optional)
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            maxLength={60}
            placeholder="@you"
            className={input}
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={join}
          disabled={state === "busy" || !ready}
          className="btn-spark rounded-md px-5 py-2 text-sm disabled:opacity-40"
        >
          {state === "busy" ? "Joining..." : "Join the team"}
        </button>
        {state === "error" && <span className="text-xs text-red-400">try again</span>}
      </div>
    </div>
  );
}

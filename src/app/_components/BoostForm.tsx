"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Flame from "./Flame";

export default function BoostForm({ capsuleId }: { capsuleId: string }) {
  const router = useRouter();
  const [backer, setBacker] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const boost = async () => {
    if (!backer.trim()) return;
    setState("busy");
    try {
      const res = await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capsule_id: capsuleId, backer: backer.trim() }),
      });
      const json = await res.json();
      if (json.ok) {
        setState("done");
        router.refresh();
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
        <Flame className="h-7 w-7 shrink-0 flame-pop" />
        <span>Boosted - you are in the data now. Thanks for backing the work.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        value={backer}
        onChange={(e) => setBacker(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && backer.trim() && boost()}
        placeholder="your email or handle"
        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        onClick={boost}
        disabled={state === "busy" || !backer.trim()}
        className="btn-spark rounded-md px-5 py-2 text-sm disabled:opacity-40"
      >
        {state === "busy" ? "Boosting..." : "Boost"}
      </button>
      {state === "error" && (
        <span className="self-center text-xs text-red-400">try again</span>
      )}
    </div>
  );
}

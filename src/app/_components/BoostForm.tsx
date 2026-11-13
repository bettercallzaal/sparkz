"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer, useViewerProfile } from "@/lib/view-as";
import JoinForm from "./JoinForm";
import Flame from "./Flame";
import { useToast } from "./toast";

// Boost a Hearth. Signed in with Farcaster: one tap, as you (the server reads the
// session). Signed out, or if the server has no session for you: an email or handle.
export default function BoostForm({ hearthId }: { hearthId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, profile } = useViewerProfile();
  const [backer, setBacker] = useState("");
  const [needsBacker, setNeedsBacker] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const { ready, writesOpen } = useViewer();
  const oneTap = isAuthenticated && !!profile?.username && !needsBacker;

  const boost = async () => {
    if (!oneTap && !backer.trim()) return;
    setState("busy");
    try {
      const body = oneTap
        ? { hearth_id: hearthId, fc_username: profile?.username }
        : { hearth_id: hearthId, backer: backer.trim() };
      const res = await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.ok) {
        setState("done");
        toast("Boost sent - you're backing the work now.");
        router.refresh();
      } else if (oneTap && res.status === 400 && String(json.error ?? "").startsWith("backer required")) {
        // Signed in on the client but no server session: ask the old way.
        setNeedsBacker(true);
        setState("idle");
      } else {
        setState("error");
        toast(json.error ?? "Could not boost - try again.", "error");
      }
    } catch {
      setState("error");
      toast("Could not boost - try again.", "error");
    }
  };

  // Private alpha (lib/alpha-access.ts): /api/boost refuses anyone without a listed
  // session. Say so before they type, and let them join the waitlist right here.
  if (ready && !writesOpen) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-muted">
          Sparkz is in private testing, so Boost is closed for now. Join the waitlist and we
          will tell you when it opens.
        </p>
        <JoinForm interest="sparkz" />
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
        <Flame className="h-7 w-7 shrink-0 flame-pop" />
        <span>Boosted - you are in the data now. Thanks for backing the work.</span>
      </div>
    );
  }

  if (oneTap) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={boost}
          disabled={state === "busy"}
          className="btn-spark min-h-11 rounded-md px-5 py-2 text-sm disabled:opacity-40"
        >
          {state === "busy" ? "Boosting..." : `Boost as @${profile?.username}`}
        </button>
        {state === "error" && <span className="text-xs text-red-400">try again</span>}
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
        className="min-h-11 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        onClick={boost}
        disabled={state === "busy" || !backer.trim()}
        className="btn-spark min-h-11 rounded-md px-5 py-2 text-sm disabled:opacity-40"
      >
        {state === "busy" ? "Boosting..." : "Boost"}
      </button>
      {state === "error" && (
        <span className="self-center text-xs text-red-400">try again</span>
      )}
    </div>
  );
}

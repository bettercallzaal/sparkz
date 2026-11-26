"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useViewer, useViewerProfile } from "@/lib/view-as";
import JoinForm from "./JoinForm";
import Flame from "./Flame";
import { useToast } from "./toast";
import { haptic } from "@/lib/native";
import { boostOutcome } from "@/lib/boost-state";

// Boost a Hearth. Signed in: one tap, as you (the server reads the session). Boosting
// needs sign-in (Zaal, ORD-465), so signed out, or when the server has no session for
// you, it asks you to sign in on the Me page.
export default function BoostForm({
  hearthId,
  initialBoosted = false,
  boostCount = 0,
}: {
  hearthId: string;
  // The server saw that this viewer's session already has a boost on this Hearth.
  initialBoosted?: boolean;
  boostCount?: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, profile } = useViewerProfile();
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(initialBoosted ? "done" : "idle");

  const { ready, writesOpen } = useViewer();
  // One tap for any signed-in backer: the server takes the identity from the session
  // cookie. On the session alone (app reopened, auth-kit empty) there is a FID but no
  // username yet (lib/session-profile.ts).
  const oneTap = isAuthenticated && !!(profile?.username || profile?.fid) && !needsSignIn;

  const boost = async () => {
    if (!oneTap) return;
    setState("busy");
    try {
      const body = { hearth_id: hearthId, ...(profile?.username ? { fc_username: profile.username } : {}) };
      const res = await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      const outcome = boostOutcome(res.status, json);
      if (outcome.next === "done") {
        setState("done");
        void haptic("success");
        toast(outcome.message);
        router.refresh();
      } else if (outcome.next === "signin") {
        // Signed in on the client but no server session: ask them to sign in again.
        setNeedsSignIn(true);
        setState("idle");
      } else {
        setState("error");
        toast(outcome.message, "error");
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
        <span>
          Boosted{boostCount > 0 ? ` (${boostCount})` : ""} - you are in the data now. Thanks for
          backing the work.
        </span>
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
          {state === "busy" ? "Boosting..." : profile?.username ? `Boost as @${profile.username}` : "Boost"}
        </button>
        {state === "error" && <span className="text-xs text-red-400">try again</span>}
      </div>
    );
  }

  return (
    <p className="text-sm text-muted">
      <Link href="/profile" className="text-accent-3 hover:underline">
        Sign in
      </Link>{" "}
      to boost this Hearth. Anyone can look around without signing in.
    </p>
  );
}

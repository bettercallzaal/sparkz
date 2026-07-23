"use client";

import { useEffect, useState } from "react";
import { useToast } from "./toast";

// "Add Sparkz" - only rendered inside a Farcaster Mini App. Calling
// sdk.actions.addMiniApp() is what makes the app addable to a user's apps screen,
// which is the prerequisite for retention AND notification eligibility. Without it a
// Mini App is single-use. On plain web this renders nothing.
export default function AddMiniApp() {
  const toast = useToast();
  const [inMiniApp, setInMiniApp] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        const ok = await sdk.isInMiniApp();
        if (alive) setInMiniApp(ok);
      } catch {
        // not in a Mini App - leave hidden
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!inMiniApp) return null;

  const add = async () => {
    setBusy(true);
    try {
      const { sdk } = await import("@farcaster/miniapp-sdk");
      await sdk.actions.addMiniApp();
      toast("Sparkz added - you'll get updates when your sparks move.");
    } catch (e) {
      const name = (e as { name?: string })?.name;
      toast(
        name === "RejectedByUser" ? "No worries - maybe later." : "Could not add - try again.",
        name === "RejectedByUser" ? "info" : "error",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={add}
      disabled={busy}
      className="rounded-lg border border-accent/50 px-3 py-1.5 text-sm text-accent hover:bg-accent/10 disabled:opacity-40"
    >
      {busy ? "Adding..." : "+ Add"}
    </button>
  );
}

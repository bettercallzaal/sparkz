"use client";

import { useState } from "react";

export default function JoinForm({ interest }: { interest?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const join = async () => {
    if (!email.trim()) return;
    setState("busy");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), interest }),
      });
      const json = await res.json();
      setState(json.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
        You are on the list. We will reach out as Sparkz opens up.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && email.trim() && join()}
        placeholder="you@email.com"
        className="flex-1 rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
      />
      <button
        onClick={join}
        disabled={state === "busy" || !email.trim()}
        className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        {state === "busy" ? "Joining..." : "Join Sparkz"}
      </button>
      {state === "error" && (
        <span className="self-center text-xs text-red-400">
          Something went wrong - try again.
        </span>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { reviewSignIn } from "@/lib/auth-session-client";

// App Review sign-in (redesign decision D3). Shown on the signed-out Me page only while
// the server has SPARKZ_REVIEW_CODE set (GET /api/auth/review). The reviewer types the
// code from the review notes; POST /api/auth/review checks it and sets the session.
export default function ReviewCodeBox({ onSignedIn }: { onSignedIn: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    const err = await reviewSignIn(code).catch(() => "Sign-in failed. Try again.");
    setBusy(false);
    if (err) setError(err);
    else onSignedIn();
  }

  return (
    <form onSubmit={submit} className="mt-5 border-t border-border pt-4">
      <label htmlFor="review-code" className="text-sm font-medium">
        App Review sign-in
      </label>
      <p className="mt-1 text-xs text-muted">Enter the code from the review notes.</p>
      <div className="mt-2 flex gap-2">
        <input
          id="review-code"
          type="password"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-transparent px-3 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="min-h-11 rounded-lg border border-border px-4 text-sm disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}

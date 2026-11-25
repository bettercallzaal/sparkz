"use client";

import { useState } from "react";

// Unblock one person (DELETE /api/blocks). Used on a blocked Hearth's page and in the
// Blocked creators list on Me. `onDone` defaults to reloading the page.
export default function UnblockButton({
  blockedId,
  onDone,
}: {
  blockedId: string;
  onDone?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unblock() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/blocks", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ blocked_id: blockedId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!json.ok) {
        setError(json.error ?? "Unblock did not go through. Try again.");
        return;
      }
      if (onDone) onDone();
      else window.location.reload();
    } catch {
      setError("Unblock did not go through. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={unblock}
        disabled={busy}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm disabled:opacity-50"
      >
        {busy ? "Unblocking..." : "Unblock"}
      </button>
      {error && <span className="mt-1 text-xs text-red-400">{error}</span>}
    </span>
  );
}

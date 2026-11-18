"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "@/lib/view-as";

// Approve button on a pending Hearth's own banner, admins only. Zaal, 16 Nov 2026:
// "I can't find the page for wwafrica" - it sat pending, and approving meant finding
// /admin/pending. Same API as the review queue (admin-gated on the server).
export default function PendingApprove({ hearthId }: { hearthId: string }) {
  const { admin } = useViewer();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!admin) return null;

  const approve = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/capsules/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: hearthId, decision: "approve" }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (json.ok) router.refresh();
    else setError(`Did not go through (${res.status}): ${json.error ?? "try again"}`);
  };

  return (
    <span className="ml-auto flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={approve}
        disabled={busy}
        className="btn-spark min-h-11 rounded-md px-4 text-sm disabled:opacity-40"
      >
        {busy ? "Approving..." : "Approve"}
      </button>
      {error && <span role="alert" className="text-xs">{error}</span>}
    </span>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "@/lib/view-as";
import { useToast } from "./toast";

export interface FarcasterLink {
  fid: number | null;
  username: string | null;
  channel: string | null;
}

// Link a Hearth to its Farcaster identity: the FID, the @username and the channel
// (for example "zao"). Used for share-to-channel casts and the Farcaster integration
// card. /api/capsules/link-farcaster existed with no UI anywhere, so every Hearth showed
// "Farcaster: not linked" and nobody could change it.
//
// Admin only, like the route (requireAdmin). The route replaces the whole link on each
// save, so the form starts from the current values.
export default function LinkFarcasterForm({
  hearthId,
  current,
}: {
  hearthId: string;
  current: FarcasterLink | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const { admin } = useViewer();
  const [fid, setFid] = useState(current?.fid ? String(current.fid) : "");
  const [username, setUsername] = useState(current?.username ?? "");
  const [channel, setChannel] = useState(current?.channel ?? "");
  const [busy, setBusy] = useState(false);

  if (!admin) return null;

  const fidNum = fid.trim() ? Number(fid.trim()) : undefined;
  const fidOk = fidNum === undefined || (Number.isInteger(fidNum) && fidNum > 0);
  const clean = (s: string) => s.trim().replace(/^[@/]+/, "") || undefined;
  const any = fidNum !== undefined || clean(username) || clean(channel);

  const save = async () => {
    if (!fidOk || !any) return;
    setBusy(true);
    try {
      const res = await fetch("/api/capsules/link-farcaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hearth_id: hearthId,
          fid: fidNum,
          username: clean(username),
          channel: clean(channel),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast("Farcaster linked.", "success");
        router.refresh();
      } else {
        toast(json.error ?? "Could not link. Try again.", "error");
      }
    } catch {
      toast("Could not link. Try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <section className="glass mt-8 p-4">
      <h2 className="text-base font-semibold">Farcaster</h2>
      <p className="mt-1 text-sm text-muted">
        Link this Hearth to its Farcaster account and channel. At least one is needed.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-muted">
          FID
          <input
            value={fid}
            onChange={(e) => setFid(e.target.value)}
            inputMode="numeric"
            placeholder="19640"
            className={`${input} mt-1`}
          />
        </label>
        <label className="text-xs text-muted">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@thezao"
            className={`${input} mt-1`}
          />
        </label>
        <label className="text-xs text-muted">
          Channel
          <input
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="/zao"
            className={`${input} mt-1`}
          />
        </label>
      </div>
      {!fidOk && <p className="mt-2 text-xs text-red-400">FID is a whole number.</p>}
      <button
        type="button"
        onClick={save}
        disabled={busy || !fidOk || !any}
        className="btn-spark mt-4 min-h-11 rounded-md px-5 text-sm disabled:opacity-40"
      >
        {busy ? "Saving..." : "Save Farcaster link"}
      </button>
    </section>
  );
}

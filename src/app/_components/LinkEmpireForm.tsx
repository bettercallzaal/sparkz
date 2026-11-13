"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "@/lib/view-as";
import { useToast } from "./toast";

// Link a Hearth to an existing Empire Builder empire (its treasury). Takes the Empire
// ID as Empire Builder shows it (0x address, fid..., c-..., or the slug); the server
// resolves it to the SmartVault treasury and records it. /api/capsules/link-empire
// existed with no UI anywhere. Admin only, like the route (requireAdmin).
export default function LinkEmpireForm({
  hearthId,
  current,
}: {
  hearthId: string;
  current: { empire_id?: string | null; empire_address?: string | null } | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const { admin } = useViewer();
  const [empireId, setEmpireId] = useState(current?.empire_id ?? "");
  const [busy, setBusy] = useState(false);

  if (!admin) return null;
  const id = empireId.trim();
  const valid = id.length >= 2 && id.length <= 120;

  const save = async () => {
    if (!valid) return;
    setBusy(true);
    try {
      const res = await fetch("/api/capsules/link-empire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hearth_id: hearthId, empire_id: id }),
      });
      const json = await res.json();
      if (json.ok) {
        toast("Empire linked.", "success");
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

  return (
    <section className="glass mt-8 p-4">
      <h2 className="text-base font-semibold">Empire Builder treasury</h2>
      <p className="mt-1 text-sm text-muted">
        Link this Hearth to its empire on Empire Builder. Paste the Empire ID (an 0x
        address, fid..., c-..., or the empire&apos;s slug).
      </p>
      {current?.empire_address && (
        <p className="mt-2 text-xs text-muted">
          Linked now: <span className="font-mono text-foreground">{current.empire_address}</span>
        </p>
      )}
      <label className="mt-4 block text-xs text-muted">
        Empire ID
        <input
          value={empireId}
          onChange={(e) => setEmpireId(e.target.value)}
          placeholder="0x... or the empire slug"
          className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>
      <button
        type="button"
        onClick={save}
        disabled={busy || !valid}
        className="btn-spark mt-4 min-h-11 rounded-md px-5 text-sm disabled:opacity-40"
      >
        {busy ? "Linking..." : "Link empire"}
      </button>
    </section>
  );
}

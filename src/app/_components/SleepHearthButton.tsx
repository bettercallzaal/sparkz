"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "@/lib/view-as";
import { useToast } from "./toast";

// Put a Hearth to sleep (dormant: off Explore's default list, page still reachable)
// or light it again. Owner or admin, like /api/capsules/update, which applies the
// lifecycle in lib/hearth-sleep.ts.
export default function SleepHearthButton({
  hearthId,
  ownerFid,
  status,
}: {
  hearthId: string;
  ownerFid: number | null;
  status: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const { admin, fid } = useViewer();
  const [busy, setBusy] = useState(false);
  const canEdit = admin || (fid !== null && ownerFid !== null && fid === ownerFid);
  if (!canEdit) return null;
  const asleep = status === "dormant";

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/capsules/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hearth_id: hearthId, asleep: !asleep }),
      });
      const json = await res.json();
      if (json.ok) {
        toast(asleep ? "Lit again." : "Put to sleep.", "success");
        router.refresh();
      } else {
        toast(json.error ?? "Could not change it. Try again.", "error");
      }
    } catch {
      toast("Could not change it. Try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass mt-8 p-4">
      <h2 className="text-base font-semibold">{asleep ? "This Hearth is asleep" : "Put to sleep"}</h2>
      <p className="mt-1 text-sm text-muted">
        {asleep
          ? "It is off Explore's main list. Its page, backers and history are all kept. Light it again any time."
          : "Takes it off Explore's main list without deleting anything. Its page, backers and history stay, and you can light it again any time."}
      </p>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`mt-4 min-h-11 rounded-md px-5 text-sm disabled:opacity-40 ${
          asleep ? "btn-spark" : "border border-border active:bg-white/10"
        }`}
      >
        {busy ? "Saving..." : asleep ? "Light it again" : "Put to sleep"}
      </button>
    </section>
  );
}

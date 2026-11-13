"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "@/lib/view-as";
import { useToast } from "./toast";

async function post(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// "Make me the owner": on a Hearth with no owner, an admin signed in with Farcaster
// takes ownership in one tap (/api/admin/claim-hearth, which only fills an empty owner).
export function ClaimHearthButton({ hearthId, className }: { hearthId: string; className?: string }) {
  const router = useRouter();
  const toast = useToast();
  const { admin, fid } = useViewer();
  const [busy, setBusy] = useState(false);
  if (!admin || !fid) return null;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const j = await post("/api/admin/claim-hearth", { hearth_id: hearthId });
          if (j.ok) {
            toast("You own this Hearth now.", "success");
            router.refresh();
          } else toast(j.error ?? "Could not take ownership.", "error");
        } catch {
          toast("Could not take ownership.", "error");
        } finally {
          setBusy(false);
        }
      }}
      className={className}
    >
      {busy ? "Saving..." : "Make me the owner"}
    </button>
  );
}

// "Set up the ZAO Hearths": adds the ZAO Hearths that are missing and fills empty
// owners (/api/admin/seed-zao, rows in lib/zao-seed.ts). Safe to tap twice.
export function SetupZaoButton() {
  const router = useRouter();
  const toast = useToast();
  const { admin } = useViewer();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  if (!admin) return null;
  return (
    <div className="px-3 pb-2">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const j = await post("/api/admin/seed-zao", {});
            if (j.ok) {
              const { added, kept, owned } = j.data as { added: string[]; kept: string[]; owned: string[] };
              setResult(
                `Added ${added.length ? added.join(", ") : "none"}. Already there: ${kept.length}. Now yours: ${owned.length ? owned.join(", ") : "none new"}.`,
              );
              toast("ZAO Hearths set up.", "success");
              router.refresh();
            } else toast(j.error ?? "Could not set up the Hearths.", "error");
          } catch {
            toast("Could not set up the Hearths.", "error");
          } finally {
            setBusy(false);
          }
        }}
        className="btn-spark min-h-11 w-full rounded-lg px-4 text-sm disabled:opacity-40"
      >
        {busy ? "Setting up..." : "Set up the ZAO Hearths"}
      </button>
      <p className="mt-1 text-xs text-muted">
        {result ??
          "Adds ZAO DEVZ, IMan Afrikah and ZAO Festivals if missing, and makes you the owner of ZABAL, ZABAL Gamez, CoC ConcertZ and Sparkz where nobody owns them."}
      </p>
    </div>
  );
}

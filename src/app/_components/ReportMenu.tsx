"use client";

import { useState } from "react";
import Link from "next/link";
import { useViewerProfile } from "@/lib/view-as";

// The "..." menu on a Hearth and on each Spark (App Store guideline 1.2; Zaal D2 and D4):
// report the content, or block the person who owns the Hearth. Reports go to the admins
// at /admin/pending and nowhere else. A block hides that person's Hearths and Sparks from
// the viewer only. Both need a session; the API answers 401 otherwise and this shows a
// sign-in link.
const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "abuse", label: "Abusive or objectionable" },
  { value: "ip", label: "Uses my work without permission" },
  { value: "other", label: "Something else" },
] as const;

type Mode = "closed" | "menu" | "report" | "block" | "done";

export default function ReportMenu({
  targetType,
  targetId,
  hearthId,
  ownerFid,
  hasOwner,
}: {
  targetType: "hearth" | "spark";
  targetId: string;
  hearthId: string;
  ownerFid: number | null;
  hasOwner: boolean;
}) {
  const { profile } = useViewerProfile();
  const [mode, setMode] = useState<Mode>("closed");
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("spam");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  // Blocking yourself is refused by the API too; this only hides the option.
  const canBlock = hasOwner && !(ownerFid !== null && profile?.fid === ownerFid);
  const thing = targetType === "hearth" ? "Hearth" : "Spark";

  async function send(url: string, body: unknown): Promise<boolean> {
    setBusy(true);
    setMsg(null);
    setNeedsSignIn(false);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setNeedsSignIn(true);
        return false;
      }
      if (!json.ok) {
        setMsg(json.error ?? `That did not go through (${res.status}). Try again.`);
        return false;
      }
      return true;
    } catch {
      setMsg("That did not go through. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function report() {
    const done = await send("/api/reports", {
      target_type: targetType,
      target_id: targetId,
      reason,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    if (done) {
      setMode("done");
      setMsg("Thanks. The Sparkz team reviews every report within 24 hours.");
    }
  }

  async function block() {
    const done = await send("/api/blocks", { hearth_id: hearthId });
    // The page re-renders without their Hearths and Sparks.
    if (done) window.location.reload();
  }

  const item =
    "flex min-h-11 w-full items-center rounded-md px-3 text-left text-sm active:bg-white/10 hover:bg-white/5";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`More options for this ${thing}`}
        aria-expanded={mode !== "closed"}
        onClick={() => setMode(mode === "closed" ? "menu" : "closed")}
        className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border px-2 text-sm text-muted hover:text-foreground"
      >
        ...
      </button>
      {mode !== "closed" && (
        <div className="absolute right-0 z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-background p-2 shadow-xl">
          {mode === "menu" && (
            <>
              <button type="button" className={item} onClick={() => setMode("report")}>
                Report this {thing}
              </button>
              {canBlock && (
                <button type="button" className={item} onClick={() => setMode("block")}>
                  Block this creator
                </button>
              )}
            </>
          )}

          {mode === "report" && (
            <div className="p-1 text-sm">
              <p className="mb-2 font-medium">Why are you reporting it?</p>
              <div className="space-y-1">
                {REASONS.map((r) => (
                  <label key={r.value} className="flex min-h-9 items-center gap-2">
                    <input
                      type="radio"
                      name={`reason-${targetId}`}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Anything we should know (optional)"
                className="mt-2 w-full rounded-md border border-border bg-transparent px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                disabled={busy}
                onClick={report}
                className="btn-spark mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg text-sm disabled:opacity-50"
              >
                {busy ? "Sending..." : "Send report"}
              </button>
            </div>
          )}

          {mode === "block" && (
            <div className="p-1 text-sm">
              <p className="font-medium">Block this creator?</p>
              <p className="mt-1 text-muted">
                You will not see their Hearths or Sparks. You can unblock them on Me.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={block}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-red-500/50 text-sm text-red-300 disabled:opacity-50"
              >
                {busy ? "Blocking..." : "Block"}
              </button>
            </div>
          )}

          {needsSignIn && (
            <p className="p-1 text-sm text-muted">
              <Link href="/profile" className="text-accent underline">
                Sign in
              </Link>{" "}
              to report or block.
            </p>
          )}
          {msg && <p className="p-1 text-sm text-muted">{msg}</p>}
        </div>
      )}
    </div>
  );
}

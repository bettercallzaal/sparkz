"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";

const TYPES = [
  { v: "creator", label: "Creator" },
  { v: "culture", label: "Culture" },
  { v: "oss", label: "Open source" },
  { v: "meme", label: "Meme" },
];

// Create a Capsule tied to the signed-in Farcaster identity. The fid/username come
// from the SIWF session and are attached so the new spark shows the creator's
// Farcaster identity and lists under their account.
export default function CreateSparkAsFarcaster({
  fid,
  username,
}: {
  fid: number;
  username?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [type, setType] = useState("creator");
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [err, setErr] = useState("");

  const create = async () => {
    if (!name.trim()) return;
    setState("busy");
    setErr("");
    try {
      const res = await fetch("/api/capsules/create-spark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          type,
          owner_fid: fid,
          fc_username: username,
          fc_channel: username, // default the Capsule's channel to the creator's handle
        }),
      });
      const json = await res.json();
      if (json.ok && json.data?.slug) {
        router.push(`/c/${json.data.slug}?lit=1`);
      } else {
        setState("error");
        const m = json.error ?? "Something went wrong - try again.";
        setErr(m);
        toast(m, "error");
      }
    } catch {
      setState("error");
      setErr("Something went wrong - try again.");
      toast("Something went wrong - try again.", "error");
    }
  };

  return (
    <div className="mt-5 border-t border-border pt-5">
      <h2 className="mb-1 text-sm font-semibold">Light a spark as {username ? `@${username}` : "you"}</h2>
      <p className="mb-3 text-xs text-muted">
        Opens a Capsule tied to your Farcaster identity. No wallet, no coin.
      </p>
      <div className="space-y-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && create()}
          placeholder="Project name"
          maxLength={80}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="One line about it (optional)"
          maxLength={280}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {TYPES.map((t) => (
            <option key={t.v} value={t.v}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={create}
          disabled={state === "busy" || !name.trim()}
          className="btn-spark w-full rounded-lg px-4 py-2.5 text-sm disabled:opacity-40"
        >
          {state === "busy" ? "Lighting..." : "Light your spark"}
        </button>
        {state === "error" && <p className="text-xs text-red-400">{err}</p>}
      </div>
    </div>
  );
}

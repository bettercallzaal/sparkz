"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";

const TYPES = [
  { v: "creator", label: "Creator - an artist, musician, or builder" },
  { v: "culture", label: "Culture - a scene or movement" },
  { v: "oss", label: "Open source - a project + its contributors" },
  { v: "meme", label: "Meme - lineage-native" },
];

export default function StartForm() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [type, setType] = useState("creator");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!name.trim() || !email.trim()) return;
    setState("busy");
    setErr("");
    try {
      const res = await fetch("/api/capsules/create-spark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim(), type, email: email.trim(), website }),
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
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Project name</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Midnight Sessions"
          maxLength={80}
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          One line about it <span className="text-muted">(optional)</span>
        </span>
        <input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="What is it, in a sentence?"
          maxLength={280}
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">What kind of spark?</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {TYPES.map((t) => (
            <option key={t.v} value={t.v}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Your email</span>
        <input
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <span className="mt-1 block text-xs text-muted">
          So the spark is yours. No wallet, no coin needed.
        </span>
      </label>

      {/* honeypot - visually hidden, off-screen; real users never fill it */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0"
        aria-hidden
      />

      <button
        onClick={submit}
        disabled={state === "busy" || !name.trim() || !email.trim()}
        className="btn-spark w-full rounded-lg px-5 py-3 text-sm disabled:opacity-40"
      >
        {state === "busy" ? "Lighting..." : "Light your spark"}
      </button>
      {state === "error" && <p className="text-xs text-red-400">{err}</p>}
    </div>
  );
}

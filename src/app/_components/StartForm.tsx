"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer, useViewerProfile } from "@/lib/view-as";
import { useToast } from "./toast";

// The one "New Hearth" form (used on /start, reached from the app's + tab and from
// Me). Signed in (any server session: SIWF on the web, Quick Auth in the mini app,
// the iPhone app): no email, the Hearth is owned by your FID. Signed out: an email
// makes it yours. Two required fields, type as large buttons, no autofocus so the
// keyboard does not jump up before you have read the screen.
// Pattern credit (design brief E1): Luma's and Partiful's few-seconds create flows.
const TYPES = [
  { v: "creator", label: "Creator", hint: "an artist, musician or builder" },
  { v: "culture", label: "Culture", hint: "a scene or movement" },
  { v: "oss", label: "Open source", hint: "a project and its contributors" },
  { v: "meme", label: "Meme", hint: "lineage-native" },
];

export default function StartForm() {
  const router = useRouter();
  const toast = useToast();
  const { profile } = useViewerProfile();
  const [realFid, setFid] = useState<number | null | undefined>(undefined); // undefined = checking
  // View-as Guest (lib/view-as.ts) shows the signed-out form. The server still reads
  // the real session on submit, so the Hearth is created as the real owner.
  const { viewAs } = useViewer();
  const fid = viewAs === "guest" ? null : realFid;
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [type, setType] = useState("creator");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [err, setErr] = useState("");

  // The server session is the truth for ownership (create-spark reads it too).
  // A slow or hung check must not leave the button disabled: after 8s, treat it as
  // signed out (the email path), which the server accepts either way.
  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    fetch("/api/auth/me", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => alive && setFid(j.ok && j.data?.fid ? j.data.fid : null))
      .catch(() => alive && setFid(null))
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  const signedIn = typeof fid === "number";
  const username = profile?.username ?? undefined;
  const ready = name.trim().length >= 2 && (signedIn || email.trim().length > 0);

  const submit = async () => {
    if (!ready) return;
    setState("busy");
    setErr("");
    try {
      const body = signedIn
        ? {
            name: name.trim(),
            bio: bio.trim(),
            type,
            owner_fid: fid,
            fc_username: username,
            fc_channel: username, // default the Hearth's channel to the creator's handle
            website,
          }
        : { name: name.trim(), bio: bio.trim(), type, email: email.trim(), website };
      const res = await fetch("/api/capsules/create-spark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    <div className="space-y-5">
      {signedIn && (
        <p className="text-xs text-muted">
          Creating as {username ? `@${username}` : `fid ${fid}`}. It lists under your account.
        </p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && submit()}
          placeholder="e.g. Midnight Sessions"
          maxLength={80}
          className="min-h-11 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base outline-none focus:border-accent sm:text-sm"
        />
      </label>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium">What is it?</legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => {
            const on = type === t.v;
            return (
              <button
                key={t.v}
                type="button"
                aria-pressed={on}
                onClick={() => setType(t.v)}
                className={`min-h-14 rounded-lg border px-3 py-2 text-left active:scale-[0.99] ${
                  on ? "border-accent bg-accent/10" : "border-border bg-card"
                }`}
              >
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="block text-[11px] text-muted">{t.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          One line about it <span className="text-muted">(optional)</span>
        </span>
        <input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="What is it, in a sentence?"
          maxLength={280}
          className="min-h-11 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base outline-none focus:border-accent sm:text-sm"
        />
      </label>

      {fid === null && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Your email</span>
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="min-h-11 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base outline-none focus:border-accent sm:text-sm"
          />
          <span className="mt-1 block text-xs text-muted">
            So the Hearth is yours. No wallet needed. Or sign in with Farcaster under Me.
          </span>
        </label>
      )}

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
        disabled={state === "busy" || !ready || fid === undefined}
        className="btn-spark min-h-12 w-full rounded-lg px-5 py-3 text-sm disabled:opacity-40"
      >
        {state === "busy" ? "Creating..." : "Create Hearth"}
      </button>
      {state === "error" && <p className="text-xs text-red-400">{err}</p>}
    </div>
  );
}

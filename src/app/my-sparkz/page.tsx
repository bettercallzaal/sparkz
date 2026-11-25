"use client";

import Link from "next/link";
import { LoadError, MeListHeader, SignInPrompt, useMeList } from "@/app/_components/MeList";
import type { MySpark, MySparkKind } from "@/lib/my-sparkz";

// Type-only import above: lib/my-sparkz pulls viem (token Spark check), which stays on
// the server.
const KIND_LABEL: Record<MySparkKind, string> = {
  moment: "Moment",
  token: "Token Spark",
  nft: "NFT drop",
  bounty: "Bounty",
  event: "Event",
  boost: "Boost",
};

// The My Sparkz tab (Zaal, 25 Nov 2026: "the sparkz someone owns in what hearth they lie
// in"): each Spark the signed-in person started or holds, with the Hearth it lives in.
// Sources in lib/my-sparkz.ts. A Spark here is a thing on a Hearth, never a whole Hearth.
export default function MySparkzPage() {
  const state = useMeList<MySpark>("/api/me/sparkz");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <MeListHeader title="My Sparkz" blurb="Your Sparks, and the Hearth each one lives in." />

      {state.kind === "loading" && <p className="text-sm text-muted">Loading your Sparkz...</p>}
      {state.kind === "signed-out" && <SignInPrompt what="your Sparkz" />}
      {state.kind === "error" && <LoadError />}
      {state.kind === "ready" &&
        (state.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-5 text-sm">
            <p className="mb-3 text-muted">
              No Sparks yet. A Spark lives on a Hearth: a bounty you post, an event, or a boost
              you give.
            </p>
            <Link href="/explore" className="btn-spark inline-flex min-h-11 items-center rounded-lg px-4 text-sm">
              Find a Hearth
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {state.rows.map((s) => (
              <li key={s.key}>
                <Link href={s.hearth.href} className="glass glass-hover flex min-h-16 items-center gap-3 p-4">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{s.title}</span>
                    <span className="block truncate text-xs text-muted">
                      in <span className="text-foreground">{s.hearth.name}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted">
                    {KIND_LABEL[s.kind]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ))}
    </main>
  );
}

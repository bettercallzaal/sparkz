"use client";

import Link from "next/link";
import Avatar from "@/app/_components/Avatar";
import { LoadError, MeListHeader, SignInPrompt, useMeList } from "@/app/_components/MeList";
import { hearthLogo } from "@/lib/hearth-logo";
import { hearthStatusLabel } from "@/lib/hearth-status";
import type { MyHearth, MyHearthRole } from "@/lib/my-sparkz";

const ROLE: Record<MyHearthRole, string> = { owner: "yours", backer: "you back it", team: "on the team" };

// The My Hearths tab: Hearths the signed-in person owns or contributes to
// (/api/me/hearths, rules in lib/my-sparkz.ts).
export default function MyHearthsPage() {
  const state = useMeList<MyHearth>("/api/me/hearths");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <MeListHeader title="My Hearths" blurb="The Hearths you own and the ones you help." />

      {state.kind === "loading" && <p className="text-sm text-muted">Loading your Hearths...</p>}
      {state.kind === "signed-out" && <SignInPrompt what="your Hearths" />}
      {state.kind === "error" && <LoadError />}
      {state.kind === "ready" &&
        (state.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-5 text-sm">
            <p className="mb-3 text-muted">
              No Hearths yet. Boost one you like and it shows up here, or ask for your own.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/explore" className="btn-spark inline-flex min-h-11 items-center rounded-lg px-4 text-sm">
                Explore Hearths
              </Link>
              <Link
                href="/start"
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm"
              >
                New Hearth
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {state.rows.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/c/${h.slug}`}
                  className="glass glass-hover flex min-h-16 items-center gap-3 p-4"
                >
                  <Avatar name={h.name} image={hearthLogo(h)} className="h-10 w-10 text-sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{h.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {h.roles.map((r) => ROLE[r]).join(", ")} - {hearthStatusLabel(h.status)}
                    </span>
                  </span>
                  {h.review === "pending" && (
                    <span className="shrink-0 rounded-full bg-accent-3/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent-3">
                      pending
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ))}
    </main>
  );
}

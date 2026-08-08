import Link from "next/link";
import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";

export const dynamic = "force-static";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Audius integration - Sparkz",
  description:
    "Connect your Audius catalog to Sparkz. Per-track split configuration, deployed on Base - collaborators claim their share at splits.org. Music-native fee distribution.",
  openGraph: {
    title: "Audius × Sparkz",
    description:
      "Your Audius streams wired to a 0xSplits contract. Music-native community fee distribution.",
    url: `${BASE}/audius`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Audius × Sparkz",
    description: "Your streams. Your split. Music-native fee distribution.",
  },
};

const STEPS = [
  {
    n: "1",
    title: "Connect your Audius handle",
    body: "Look up your catalog stats - no login required for read-only access. Plays, favorites, reposts by track.",
  },
  {
    n: "2",
    title: "See your engagement breakdown",
    body: "Top tracks by plays, total favorites and reposts. This is your community activity in aggregate - the proof before any token.",
  },
  {
    n: "3",
    title: "Map engagement to split weights (v2)",
    body: "When fan-level data is available via Audius SDK, each listener's plays + favorites + reposts maps to a weight in your community pool: plays×1, favorites×3, reposts×5.",
  },
  {
    n: "4",
    title: "Export to 0xSplits",
    body: "Paste the exported JSON into app.splits.org or call updateSplit() after human review. Collaborators claim at splits.org - pull model, no deadline.",
  },
];

const WHY = [
  {
    icon: "🎵",
    title: "Music-native",
    body: "Audius creators already have a streaming audience. Sparkz connects that audience directly to fee distribution - no new community to build.",
  },
  {
    icon: "🤝",
    title: "Collab-first",
    body: "Set collaborator roles and percentages before upload. Producer, featured artist, mixing engineer - all documented on-chain, all claimable at splits.org.",
  },
  {
    icon: "📊",
    title: "Engagement-weighted",
    body: "In v2, fan engagement (plays, favorites, reposts) maps directly to community pool weights. The fans who show up the most earn the most.",
  },
  {
    icon: "🔒",
    title: "Pull model, no lockups",
    body: "Fees accumulate in the 0xSplits contract. Recipients claim at splits.org whenever they like. No deadline, no auto-distribution, no wallet trust required.",
  },
];

export default function AudiusPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      {/* Hero */}
      <section className="pt-14 pb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/5 px-3 py-1 text-xs font-semibold text-purple-400">
          🎵 Audius × Sparkz
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Your Audius catalog,<br />wired to your split.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Audius is where music-native creators already have an audience. Sparkz connects your stream data to your split config - collaborators claim their share at splits.org, no deadline.
        </p>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          How it works
        </h2>
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.n} className="glass flex gap-4 p-4">
              <div className="w-6 shrink-0 text-sm font-bold text-purple-400">{s.n}</div>
              <div>
                <div className="mb-1 font-semibold text-sm">{s.title}</div>
                <p className="text-xs leading-relaxed text-muted">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          Why music creators use this
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {WHY.map((w) => (
            <div key={w.title} className="glass p-4">
              <div className="mb-2 text-2xl">{w.icon}</div>
              <div className="mb-1 font-semibold text-sm">{w.title}</div>
              <p className="text-xs leading-relaxed text-muted">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Status */}
      <section className="border-t border-border py-8">
        <div className="card-solid p-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">
            Integration status
          </div>
          <h3 className="mb-2 text-base font-semibold">V1 - read-only catalog stats</h3>
          <p className="mb-3 text-sm text-muted">
            V1 fetches your Audius catalog stats (plays, favorites, reposts) without login. The split config is set manually in the split advisor. V2 will map per-listener engagement to community pool weights automatically.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-green-500/30 bg-green-500/5 px-2 py-0.5 text-xs text-green-400">
              ✓ Catalog stats (v1)
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
              ○ Per-listener weights (v2)
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
              ○ Auto split-update export (v2)
            </span>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="border-t border-border py-8">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/advisor" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Configure your split</div>
            <div className="text-xs text-muted">3 questions → recommended split config</div>
          </Link>
          <Link href="/start" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Light a spark</div>
            <div className="text-xs text-muted">Open your Hearth now - no token needed</div>
          </Link>
          <Link href="/examples" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Spark examples</div>
            <div className="text-xs text-muted">See the music collab template</div>
          </Link>
          <a
            href="https://audius.co"
            target="_blank"
            rel="noreferrer"
            className="glass glass-hover p-3"
          >
            <div className="font-medium text-sm">audius.co ↗</div>
            <div className="text-xs text-muted">Decentralized music streaming</div>
          </a>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-xs text-muted">
        Sparkz - back the work, build the collective, earn transparently.
      </footer>
    </main>
  );
}

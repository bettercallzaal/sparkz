import Link from "next/link";
import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";

export const dynamic = "force-static";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Meme Engine - Sparkz",
  description:
    "The Sparkz Meme Engine: one human-in-the-loop creative intelligence loop. Flag a moment → ZOL drafts 3 variants → you approve → community remixes → attribution + receipts.",
  openGraph: {
    title: "Meme Engine - Sparkz",
    description:
      "Human-gated creative AI. ZOL drafts. You approve. No autonomous posting.",
    url: `${BASE}/meme-engine`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meme Engine - Sparkz",
    description: "Human-gated creative loop. ZOL drafts, you approve, community remixes.",
  },
};

const STEPS = [
  {
    n: "1",
    title: "Flag a moment",
    body: "A milestone hits - leaderboard milestone, cultural moment, community achievement. You (or ZOL's detect-moment script) flag it. ZOL reads live Hearth data: leaderboard stats, recent boosts, treasury balance.",
    tag: "Human or auto-detect",
  },
  {
    n: "2",
    title: "ZOL drafts 3 variants",
    body: "ZOL generates three cast drafts - different angles, tones, or hooks - all grounded in real Hearth data (not hallucinated stats). Drafts land in the /zol approve panel.",
    tag: "ZOL (advisory tier)",
  },
  {
    n: "3",
    title: "You pick and approve",
    body: "You read the three variants, pick the one that fits, optionally edit it, and click the Warpcast compose link. One human click = the final gate. ZOL never posts without it.",
    tag: "Human approval - non-negotiable",
  },
  {
    n: "4",
    title: "Post goes live",
    body: "The approved cast goes live on Farcaster via Neynar. Timestamp, attribution, and Hearth link are included. The cast is canonical - it's the record of the moment.",
    tag: "Human-gated post",
  },
  {
    n: "5",
    title: "Community Swarm remixes",
    body: "For 24 hours after posting, track-remix scores incoming quote-casts. Top remixers get flagged for contribution credit in the next snapshot - building into leaderboard weight.",
    tag: "Community attribution",
  },
  {
    n: "6",
    title: "Receipt + reward",
    body: "Snapshot runs. Top contributors earn points. The weekly receipt reflects their contribution. Fee share follows contribution, not speculation.",
    tag: "Transparent attribution",
  },
];

const GUARDRAILS = [
  {
    title: "ZOL never posts autonomously",
    body: "Every cast requires a human to click the Warpcast compose link. The agent drafts; the human posts. No exceptions in v1.",
  },
  {
    title: "No fabricated data",
    body: "All drafts are grounded in live Hearth data - real leaderboard counts, real pool math. ZOL does not invent stats.",
  },
  {
    title: "No on-chain signing",
    body: "ZOL does not deploy contracts, sign transactions, or move funds. Those actions require a designated human wallet.",
  },
  {
    title: "Advisory tier only (v1)",
    body: "v1 Meme Engine runs at autonomy Tier 1 - 3: advisory, creative, guarded. Tier 4 (mature/autonomous) is not available until trust is established.",
  },
];

export default function MemeEnginePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      {/* Hero */}
      <section className="pt-14 pb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
          ZOL / Meme Engine
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          The loop that turns culture into content.
        </h1>
        <p className="mt-4 text-lg text-muted">
          One human-in-the-loop creative intelligence loop. ZOL reads your Hearth data, drafts three variants, and waits for your approval. You post. Community remixes. Attribution flows.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-border px-2 py-0.5">✓ ZOL drafts, human approves</span>
          <span className="rounded-full border border-border px-2 py-0.5">✓ Grounded in real Hearth data</span>
          <span className="rounded-full border border-border px-2 py-0.5">✓ No autonomous posting (v1)</span>
        </div>
      </section>

      {/* The loop */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          The 6-step loop
        </h2>
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.n} className="glass flex gap-4 p-4">
              <div className="w-6 shrink-0 text-sm font-bold text-accent">{s.n}</div>
              <div>
                <div className="mb-0.5 font-semibold text-sm">{s.title}</div>
                <p className="text-xs leading-relaxed text-muted">{s.body}</p>
                <span className="mt-1.5 inline-block rounded-full border border-border px-2 py-0.5 text-xs text-muted/70">
                  {s.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guardrails */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          Guardrails (v1 hard rules)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {GUARDRAILS.map((g) => (
            <div key={g.title} className="card-solid p-4">
              <div className="mb-1 font-semibold text-sm">{g.title}</div>
              <p className="text-xs leading-relaxed text-muted">{g.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Zoostr live example */}
      <section className="border-t border-border py-8">
        <div className="glass p-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">
            Live example
          </div>
          <h3 className="mb-2 text-base font-semibold">Zoostr - the first Meme Engine deployment</h3>
          <p className="mb-3 text-sm text-muted">
            ZABAL runs ZOL to track the Zoostr empire: milestone detection from live Boostr stats, three-variant drafting for Farcaster casts, human approval via the /zol panel, 24h remix scoring, weekly snapshot → receipt. The full loop runs on one human click.
          </p>
          <a
            href="https://zoostr.xyz/zol"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm text-accent hover:underline"
          >
            See the /zol admin panel at zoostr.xyz ↗
          </a>
        </div>
      </section>

      {/* CTAs */}
      <section className="border-t border-border py-8">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/start" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Light a spark</div>
            <div className="text-xs text-muted">Open your Hearth - Meme Engine activates at your first milestone</div>
          </Link>
          <Link href="/vetted" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Get ZOL support</div>
            <div className="text-xs text-muted">Vetted projects get ZOL agent access + aligned stake</div>
          </Link>
          <Link href="/examples" className="glass glass-hover p-3">
            <div className="font-medium text-sm">See spark templates</div>
            <div className="text-xs text-muted">How the Meme Engine fits different creator types</div>
          </Link>
          <Link href="/community-pool" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Economics</div>
            <div className="text-xs text-muted">1% treasury upkeep funds ZOL compute for all creators</div>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-xs text-muted">
        ZOL drafts. Human approves. No cast posts without explicit human selection. Guardrail is non-negotiable in v1. Attribution flows to contributors, not to token holders.
      </footer>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const OG = `${BASE}/api/og?title=${encodeURIComponent("Contribution")}&subtitle=${encodeURIComponent("How Sparkz measures what you give")}`;

export const metadata: Metadata = {
  title: "Contribution — Sparkz",
  description:
    "How Sparkz measures contribution: boosts, backs, receipts, and remixes — each earns leaderboard points. Contribution-weighted, not holding-weighted. Pull model via 0xSplits.",
  openGraph: {
    title: "Contribution — Sparkz",
    description:
      "Owning earns optionality. Contributing earns fee share. Here's how Sparkz tracks what you actually give: boosts, backs, meme receipts, remixes — points, not bags.",
    url: `${BASE}/contribution`,
    images: [{ url: OG, width: 1200, height: 630, alt: "Contribution — Sparkz" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contribution — Sparkz",
    description: "Contribution-weighted, not holding-weighted. Points, not bags.",
    images: [OG],
  },
  other: {
    "fc:miniapp": "true",
    "fc:frame": "vNext",
    "fc:frame:image": OG,
    "fc:frame:button:1": "🔥 Start a Capsule",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${BASE}/start`,
    "fc:frame:button:2": "📊 See the split",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${BASE}/community-pool`,
  },
};

const CONTRIBUTION_TYPES = [
  {
    icon: "⚡",
    name: "Boost",
    what: "Like or amplify a Capsule cast on Farcaster.",
    weight: "High",
    tracked: "Boostr points (zabalLikesCount), Meme Engine engagement score",
    example: "Like a ZABAL cast via Boostr → earns points on the leaderboard",
  },
  {
    icon: "💸",
    name: "Back",
    what: "Support the Capsule with a fiat tier (Spark / Booster / Patron) or on-chain boost.",
    weight: "High",
    tracked: "Patronage tier, one-time or recurring",
    example: "A $25 Booster backing earns leaderboard weight proportional to tier",
  },
  {
    icon: "🎭",
    name: "Meme receipt",
    what: "Remix or quote-cast a Meme Engine post within the 24h community swarm window.",
    weight: "Medium",
    tracked: "Remix score via track-remix CLI; attribution logged to Capsule",
    example: "Quote a ZOL post within 24h → 20% remix reward share",
  },
  {
    icon: "🗣️",
    name: "Farcaster participation",
    what: "Reply, react, and engage with Capsule posts in Warpcast.",
    weight: "Low",
    tracked: "Followers count, engagement signals (v1 advisory only)",
    example: "Higher follower count raises Boostr score multiplier",
  },
];

const HOLDING_VS_CONTRIBUTION = [
  {
    action: "Hold the token",
    earns: "Optionality — can trade anytime",
    doesNotEarn: "Fee share from the community pool",
    why: "Holding is passive. The community pool rewards what you give, not what you own.",
  },
  {
    action: "Contribute to the Capsule",
    earns: "Proportional fee share from the community pool",
    doesNotEarn: "Automatic payouts — pull model",
    why: "Points accumulate from contribution actions, not token balance.",
  },
];

const HOW_POINTS_WORK = [
  { n: "1", title: "You act", body: "You boost, back, remix, or participate. Each action is tracked by the relevant integration (Boostr, Meme Engine, patronage)." },
  { n: "2", title: "Points accumulate", body: "Each action earns points on the Capsule leaderboard. Points are cumulative — they don't reset unless the creator explicitly resets the leaderboard." },
  { n: "3", title: "Weekly snapshot", body: "ZOL takes a weekly snapshot of total points across all contributors. Your proportional share = your points ÷ total points." },
  { n: "4", title: "0xSplits weights updated", body: "Proportional shares convert to integer weights (sum 1,000,000). The 0xSplits contract is updated with the new weights." },
  { n: "5", title: "Claim at splits.org", body: "Pull model — your accumulated fee share is claimable at splits.org. No deadline. No auto-payout. Claim when you want." },
];

const INTEGRATIONS = [
  {
    name: "Boostr",
    url: "https://boostr.itscashless.com",
    what: "Social contribution layer: tracks Farcaster engagement on creator casts. Contribution metric: zabalLikesCount + followers_count.",
    status: "Live (Zoostr first circle)",
  },
  {
    name: "Meme Engine",
    url: "/meme-engine",
    what: "Cultural contribution layer: 24h community swarm window for remixing ZOL drafts. Track-remix CLI scores attribution.",
    status: "Beta — runs on each ZOL post",
  },
  {
    name: "Patronage tiers",
    url: "/patronage",
    what: "Fiat backing layer: Spark ($5) / Booster ($25) / Patron ($100) tiers earns leaderboard weight.",
    status: "V1 — one-time tiers (recurring is v2)",
  },
];

export default function ContributionPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 space-y-14">
      {/* Header */}
      <section>
        <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wider">
          Sparkz mechanics
        </p>
        <h1 className="text-4xl font-bold mb-4">Contribution</h1>
        <p className="text-muted text-lg leading-relaxed">
          Sparkz is contribution-weighted, not holding-weighted. Owning a token
          gives you optionality — you can trade it. Contributing to the Capsule
          gives you fee share. Here&rsquo;s exactly how Sparkz measures what you give.
        </p>
      </section>

      {/* Core principle */}
      <section className="card-solid border border-accent/20 rounded-2xl p-6">
        <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
          Core principle
        </div>
        <p className="text-foreground font-semibold text-lg mb-2">
          Holding is not contribution.
        </p>
        <p className="text-muted text-sm leading-relaxed">
          A wallet with 1,000,000 tokens that never boosts, backs, or remixes earns
          zero fee share from the community pool. A fan with 10 boosts and no tokens
          earns their proportional cut every week.
        </p>
      </section>

      {/* Types of contribution */}
      <section>
        <h2 className="text-xl font-bold mb-5">Types of contribution</h2>
        <div className="space-y-4">
          {CONTRIBUTION_TYPES.map((c) => (
            <div key={c.name} className="card-solid border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{c.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-muted text-xs">{c.what}</div>
                </div>
                <span className="ml-auto text-xs font-semibold text-accent border border-accent/20 rounded px-2 py-0.5">
                  {c.weight}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <span className="text-muted shrink-0 w-16">Tracked by</span>
                  <span className="text-foreground/80">{c.tracked}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted shrink-0 w-16">Example</span>
                  <span className="text-foreground/80">{c.example}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How points flow to fee share */}
      <section>
        <h2 className="text-xl font-bold mb-5">From contribution to fee share</h2>
        <div className="space-y-3">
          {HOW_POINTS_WORK.map((s) => (
            <div key={s.n} className="card-solid border border-border rounded-xl p-4 flex gap-4">
              <div className="text-accent font-black text-sm shrink-0 w-5 pt-0.5">{s.n}</div>
              <div>
                <div className="font-semibold text-sm mb-1">{s.title}</div>
                <div className="text-muted text-xs leading-relaxed">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Holding vs contributing */}
      <section>
        <h2 className="text-xl font-bold mb-2">Holding vs. contributing</h2>
        <p className="text-muted text-sm mb-5">
          These are not the same thing. Sparkz tracks them separately.
        </p>
        <div className="space-y-3">
          {HOLDING_VS_CONTRIBUTION.map((h) => (
            <div key={h.action} className="card-solid border border-border rounded-xl p-5">
              <div className="font-semibold text-sm mb-3">{h.action}</div>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-accent font-semibold mb-1">Earns</div>
                  <div className="text-foreground/80">{h.earns}</div>
                </div>
                <div>
                  <div className="text-muted font-semibold mb-1">Does NOT earn</div>
                  <div className="text-muted">{h.doesNotEarn}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted border-t border-border pt-3">
                {h.why}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section>
        <h2 className="text-xl font-bold mb-5">Contribution integrations</h2>
        <div className="space-y-3">
          {INTEGRATIONS.map((i) => (
            <div key={i.name} className="card-solid border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{i.name}</div>
                <span className="text-xs text-muted">{i.status}</span>
              </div>
              <div className="text-xs text-muted leading-relaxed mb-2">{i.what}</div>
              {i.url.startsWith("http") ? (
                <a
                  href={i.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent text-xs hover:underline"
                >
                  {i.url} ↗
                </a>
              ) : (
                <Link href={i.url} className="text-accent text-xs hover:underline">
                  {BASE}{i.url} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/start"
          className="btn-spark px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          🔥 Start a Capsule
        </Link>
        <Link
          href="/community-pool"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          💰 Community pool
        </Link>
        <Link
          href="/economics"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          📐 Economics
        </Link>
        <Link
          href="/token-timing"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          ⏱ Token timing
        </Link>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const OG = `${BASE}/api/og?title=${encodeURIComponent("Spark Templates")}&subtitle=${encodeURIComponent("7 blueprints — start with culture, not a coin")}`;

export const metadata: Metadata = {
  title: "Spark Templates — Sparkz",
  description:
    "7 concrete Spark blueprints: community leaderboard, music collab, group crowdfund, solo patronage, PFP community, podcast split, gaming clan. Each starts tokenless.",
  openGraph: {
    title: "Spark Templates — Sparkz",
    description:
      "7 blueprints for launching a Spark. Each one starts tokenless and shows the no-coin-to-start model in action.",
    url: `${BASE}/examples`,
    images: [{ url: OG, width: 1200, height: 630, alt: "Spark Templates" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark Templates — Sparkz",
    description:
      "7 blueprints. Community leaderboard, music collab, group crowdfund, and more.",
    images: [OG],
  },
  other: {
    "fc:miniapp": "true",
    "fc:frame": "vNext",
    "fc:frame:image": OG,
    "fc:frame:button:1": "🔥 Start a Spark",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${BASE}/start`,
    "fc:frame:button:2": "🪄 Split wizard",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${BASE}/split-wizard`,
  },
};

type Timing = "now" | "later" | "never";

const TEMPLATES = [
  {
    id: "community-leaderboard",
    emoji: "📊",
    name: "Community Leaderboard",
    subtitle: "The Zoostr model",
    description:
      "Build a public leaderboard of contributors before any token exists. Boost content → earn points → claim fee share weekly. The community creates the value; the token reflects it.",
    realExample: "Zoostr (zoostr.xyz) — 50+ boosters, live on Base",
    realLink: "https://zoostr.xyz/leaderboard",
    tokenless: "Leaderboard + Boostr backing + weekly Meme Engine receipts",
    split: { community: 50, creator: 25, treasury: 25 },
    tokenTiming: "later" as Timing,
    tokenNote: "Launch when 30+ consistent contributors prove the leaderboard",
    splitRationale:
      "50% to leaderboard by points (weekly snapshot → 0xSplits). 25% creator ops. 25% treasury for future liquidity.",
    tag: "Live example",
    tagColor: "bg-accent/15 text-accent border border-accent/30",
  },
  {
    id: "music-collab",
    emoji: "🎵",
    name: "Music Collab",
    subtitle: "Both artists earn on every stream",
    description:
      "Two artists release a joint track. Split-sheet is locked before launch: artist A gets 50%, artist B gets 40%, producer gets 10%. Every fee split routes through 0xSplits automatically.",
    realExample: null,
    realLink: null,
    tokenless: "0xSplits split-sheet + Farcaster promo + meme receipt at release",
    split: { community: 20, creator: 70, treasury: 10 },
    tokenTiming: "later" as Timing,
    tokenNote:
      "Split-sheet must be locked in 0xSplits before any token launch — no exceptions",
    splitRationale:
      "70% routes through the 0xSplits contract to collaborators (A/B/producer shares). 20% community pool for superfans. 10% treasury.",
    tag: "Blueprint",
    tagColor: "bg-foreground/5 text-muted border border-border",
  },
  {
    id: "group-crowdfund",
    emoji: "🏛️",
    name: "Group Crowdfund",
    subtitle: "Fund a project without speculation",
    description:
      "A community funds a real-world project (conference, album, event). Backers get patronage tiers ($5/$25/$100). When the project ships, backers claim fee share from any future token. No coin required to fund.",
    realExample: null,
    realLink: null,
    tokenless:
      "Patronage tiers (card, no wallet) + Farcaster backing window + milestone receipts",
    split: { community: 80, creator: 10, treasury: 10 },
    tokenTiming: "never" as Timing,
    tokenNote:
      "Token optional — the crowdfund model works without it. Add only if community demands it after the project ships.",
    splitRationale:
      "80% to backer pool (equal share by backing contribution). 10% creator/ops. 10% treasury.",
    tag: "Blueprint",
    tagColor: "bg-foreground/5 text-muted border border-border",
  },
  {
    id: "solo-patronage",
    emoji: "🎤",
    name: "Solo Creator Patronage",
    subtitle: "Fans back the work, not the coin",
    description:
      "A solo artist or writer launches a Sparkz Capsule. Fans can back with a card (no wallet, no gas) at $5/$25/$100. The creator earns directly; no token required. Ideal for non-crypto audiences.",
    realExample: null,
    realLink: null,
    tokenless:
      "Stripe patronage tiers (card) + monthly Meme Engine update post + 0xSplits for collaborators",
    split: { community: 1, creator: 97, treasury: 2 },
    tokenTiming: "later" as Timing,
    tokenNote:
      "Token when you hit 10+ consistent backers and want to grow the community pool",
    splitRationale:
      "97% goes to the creator. 1% community pool signal (grows as community grows). 2% treasury for compute upkeep.",
    tag: "Blueprint",
    tagColor: "bg-foreground/5 text-muted border border-border",
  },
  {
    id: "pfp-community",
    emoji: "🖼️",
    name: "PFP Community",
    subtitle: "Culture identity before any token",
    description:
      "A PFP project uses Sparkz as the backing layer before any token. Holders boost community casts → earn leaderboard points → eventual fee share when a token launches. Culture accumulates before the coin.",
    realExample: null,
    realLink: null,
    tokenless:
      "Boostr leaderboard + PFP-gated Discord via Farcaster SIWE + weekly receipts",
    split: { community: 30, creator: 60, treasury: 10 },
    tokenTiming: "later" as Timing,
    tokenNote: "Token when leaderboard proves 30+ consistent contributors",
    splitRationale:
      "30% to PFP holder pool (by leaderboard contribution, not holding). 60% creator/team. 10% treasury.",
    tag: "Blueprint",
    tagColor: "bg-foreground/5 text-muted border border-border",
  },
  {
    id: "podcast-split",
    emoji: "🎙️",
    name: "Podcast Split",
    subtitle: "Co-hosts and editors each earn on-chain",
    description:
      "A podcast with 2 co-hosts and an editor wires their split before launch. Every episode promoted via Farcaster generates contribution points. 0xSplits routes the fee share to all three automatically.",
    realExample: null,
    realLink: null,
    tokenless:
      "0xSplits for co-host split + Farcaster episode posts + episode receipt after each drop",
    split: { community: 15, creator: 75, treasury: 10 },
    tokenTiming: "never" as Timing,
    tokenNote:
      "Tokenless is often right for podcasts — the subscription model is the business",
    splitRationale:
      "75% through 0xSplits to co-hosts/editor per agreed percentages. 15% listener community pool. 10% treasury.",
    tag: "Blueprint",
    tagColor: "bg-foreground/5 text-muted border border-border",
  },
  {
    id: "gaming-clan",
    emoji: "🎮",
    name: "Gaming Clan",
    subtitle: "Tournament wins → on-chain receipts",
    description:
      "A competitive gaming clan uses Sparkz to distribute tournament earnings and sponsor fees to members by contribution (practice hours, match wins, content creation). No token required to start.",
    realExample: null,
    realLink: null,
    tokenless:
      "0xSplits clan treasury + Farcaster win receipts + contribution-weighted leaderboard",
    split: { community: 40, creator: 50, treasury: 10 },
    tokenTiming: "later" as Timing,
    tokenNote: "Token if the clan grows to 50+ active members and wants a tradeable stake",
    splitRationale:
      "40% clan pool (contribution-weighted by wins/practice). 50% management/infrastructure. 10% treasury.",
    tag: "Blueprint",
    tagColor: "bg-foreground/5 text-muted border border-border",
  },
];

const TIMING_CONFIG: Record<
  Timing,
  { label: string; icon: string; color: string }
> = {
  now: { label: "Token now", icon: "🚀", color: "text-accent" },
  later: { label: "Token later", icon: "⏳", color: "text-foreground" },
  never: { label: "Tokenless", icon: "🛡️", color: "text-muted" },
};

export default function ExamplesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-14">
      {/* Header */}
      <section>
        <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wider">
          Spark templates
        </p>
        <h1 className="text-4xl font-bold mb-4">7 ways to start a Spark</h1>
        <p className="text-muted text-lg leading-relaxed">
          Every template starts tokenless. A token is optional, later — or never. The
          culture and the community come first.
        </p>
      </section>

      {/* Template grid */}
      <section className="space-y-8">
        {TEMPLATES.map((t) => {
          const timing = TIMING_CONFIG[t.tokenTiming];
          return (
            <div
              key={t.id}
              className="card-solid rounded-2xl p-6 border border-border space-y-5"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{t.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-lg">{t.name}</h2>
                      <span
                        className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${t.tagColor}`}
                      >
                        {t.tag}
                      </span>
                    </div>
                    <p className="text-muted text-sm">{t.subtitle}</p>
                  </div>
                </div>
                <div
                  className={`shrink-0 text-xs font-semibold ${timing.color} flex items-center gap-1`}
                >
                  {timing.icon} {timing.label}
                </div>
              </div>

              {/* Description */}
              <p className="text-foreground/80 text-sm leading-relaxed">
                {t.description}
              </p>

              {/* Tokenless starting point */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3">
                <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                  Tokenless starting point
                </div>
                <p className="text-sm text-foreground/80">{t.tokenless}</p>
              </div>

              {/* Split config */}
              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                  Suggested split
                </div>

                {/* Visual bar */}
                <div className="flex h-3 w-full overflow-hidden rounded-full mb-3 border border-border">
                  <div
                    className="bg-accent"
                    style={{ width: `${t.split.community}%` }}
                  />
                  <div
                    className="bg-foreground/50"
                    style={{ width: `${t.split.creator}%` }}
                  />
                  <div
                    className="bg-muted/30"
                    style={{ width: `${t.split.treasury}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-accent font-bold">{t.split.community}%</span>
                    <span className="text-muted ml-1">community</span>
                  </div>
                  <div>
                    <span className="text-foreground font-bold">{t.split.creator}%</span>
                    <span className="text-muted ml-1">creator</span>
                  </div>
                  <div>
                    <span className="text-muted font-bold">{t.split.treasury}%</span>
                    <span className="text-muted ml-1">treasury</span>
                  </div>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  {t.splitRationale}
                </p>
              </div>

              {/* Token timing note */}
              <div className="text-xs text-muted border-t border-border pt-3 leading-relaxed">
                <span className="font-semibold text-foreground/60">Token timing: </span>
                {t.tokenNote}
              </div>

              {/* Real example */}
              {t.realExample && t.realLink && (
                <div className="text-xs">
                  <span className="text-muted">Live example: </span>
                  <a
                    href={t.realLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {t.realExample} →
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* CTAs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Start your Spark</h2>
        <p className="text-muted text-sm leading-relaxed">
          Pick the template that fits, then open a Capsule. ZAO reviews every
          self-serve submission — no permissionless minting.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/start"
            className="btn-spark px-5 py-2.5 text-sm font-semibold rounded-lg"
          >
            🔥 Open a Capsule
          </Link>
          <Link
            href="/advisor"
            className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
          >
            🎯 Ask the advisor
          </Link>
          <Link
            href="/split-wizard"
            className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
          >
            🪄 Split wizard
          </Link>
          <Link
            href="/token-timing"
            className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
          >
            ⏱ Token timing
          </Link>
        </div>
      </section>
    </main>
  );
}

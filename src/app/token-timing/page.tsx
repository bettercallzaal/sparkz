import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const OG = `${BASE}/api/og?title=${encodeURIComponent("Token Timing")}&subtitle=${encodeURIComponent("Now · Later · Never - know before you launch")}`;

export const metadata: Metadata = {
  title: "Token Timing - Sparkz",
  description:
    "When should a Sparkz creator launch a token? Now, later, or never - a decision framework for tokenizing community culture without blowing it up.",
  openGraph: {
    title: "Token Timing - Sparkz",
    description:
      "Now / Later / Never - the token-timing decision framework for creator communities.",
    url: `${BASE}/token-timing`,
    images: [{ url: OG, width: 1200, height: 630, alt: "Token Timing - Sparkz" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Token Timing - Sparkz",
    description: "When to launch a token. When to wait. When to never.",
    images: [OG],
  },
  other: {
    "fc:miniapp": "true",
    "fc:frame": "vNext",
    "fc:frame:image": OG,
    "fc:frame:button:1": "🔥 Start a Hearth",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${BASE}/start`,
    "fc:frame:button:2": "🎯 Ask the advisor",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${BASE}/advisor`,
  },
};

type Timing = "now" | "later" | "never";

const TIMINGS: {
  id: Timing;
  label: string;
  headline: string;
  icon: string;
  color: string;
  border: string;
  bg: string;
  conditions: string[];
  risks: string[];
  action: string;
}[] = [
  {
    id: "now",
    label: "Launch Now",
    headline: "Culture is proven. Community pulled it into existence.",
    icon: "🚀",
    color: "text-accent",
    border: "border-accent/30",
    bg: "bg-accent/5",
    conditions: [
      "You have 50+ engaged backers before any token mention",
      "The community is asking for a way to participate economically",
      "You have a real 0xSplits config ready - collaborators, weights, wallets",
      "You've run a split-wizard dry run and everyone signed off",
      "ZAO vetting is complete or you're self-sovereign with a clear rationale",
    ],
    risks: [
      "Token arrival can shift attention from culture to price - be ready for it",
      "If the token underperforms early, some backers conflate that with the community failing",
      "Make sure 0xSplits is wired before launch - retroactive splits are hard",
    ],
    action: "Use the /advisor to finalize your split config, then /split-wizard to generate the 0xSplits JSON. Token goes last.",
  },
  {
    id: "later",
    label: "Wait - Launch Later",
    headline: "The culture is real but not yet self-sustaining.",
    icon: "⏳",
    color: "text-foreground",
    border: "border-border",
    bg: "bg-card-solid",
    conditions: [
      "You have engaged backers, but the community is still finding its identity",
      "Collaboration structure isn't finalized - split-sheet disputes would follow a launch",
      "You want to grow without the pressure of a price chart",
      "Tokenless fee share (patronage tiers, backing) is already covering your costs",
    ],
    risks: [
      "Waiting too long while others launch can feel like missing out - that feeling is usually wrong",
      "Culture compounds faster without token speculation in the room - trust the process",
    ],
    action: "Open a Hearth now. Start with /patronage backing tiers ($5/$25/$100). Set a concrete graduation trigger - e.g. '200 backers and a live 0xSplits config.'",
  },
  {
    id: "never",
    label: "Never - Stay Tokenless",
    headline: "The community functions better without a tradeable token.",
    icon: "🛡️",
    color: "text-muted",
    border: "border-border",
    bg: "bg-card-solid",
    conditions: [
      "Your community is tightly knit and a public market would introduce noise",
      "The fee share from patronage tiers already creates a sustainable loop",
      "Regulatory clarity in your jurisdiction is unclear and you'd rather not navigate it",
      "The mission is explicitly non-extractive and a token would contradict that",
    ],
    risks: [
      "Tokenless communities can struggle with onboarding people who expect a liquid stake",
      "Backers may eventually push for a token - address this in your Hearth FAQ early",
    ],
    action: "Lean into the patronage tier model + 0xSplits for collaborators. A token is optional, not mandatory. Plenty of lasting communities never tokenize.",
  },
];

const PRINCIPLES = [
  {
    title: "Culture before token",
    body: "A token amplifies what already exists. Launch into a vacuum and price becomes the whole story - which then crashes.",
  },
  {
    title: "Community pull > creator push",
    body: "The strongest signal is when backers start asking \"how can we participate economically?\" That's the launch trigger, not the calendar.",
  },
  {
    title: "0xSplits before launch day",
    body: "Wire the split-sheet before the token. Retroactive splits are a legal and relational nightmare. Build the distribution wallet first.",
  },
  {
    title: "Token optional, access mandatory",
    body: "Access to the community, the work, and the receipts shouldn't require owning a token. Tokenless tiers preserve this for everyone.",
  },
];

export default function TokenTimingPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 space-y-14">
      {/* Header */}
      <section>
        <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wider">
          Decision framework
        </p>
        <h1 className="text-4xl font-bold mb-4">Token Timing</h1>
        <p className="text-muted text-lg leading-relaxed">
          When should a creator community launch a token? The answer determines whether the
          token amplifies culture or replaces it. Three stances - and how to know which
          one fits.
        </p>
        <p className="text-muted text-sm mt-3">
          The AI advisor distills this into a 3-question flow. This page shows the
          underlying reasoning.
        </p>
      </section>

      {/* The three timings */}
      <section className="space-y-5">
        {TIMINGS.map((t) => (
          <div key={t.id} className={`card-solid border ${t.border} rounded-2xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <div className={`font-bold text-base ${t.color}`}>{t.label}</div>
                <div className="text-muted text-sm">{t.headline}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Ready when
              </div>
              <ul className="space-y-1">
                {t.conditions.map((c) => (
                  <li key={c} className="text-sm flex gap-2">
                    <span className="text-accent shrink-0 mt-0.5">✓</span>
                    <span className="text-foreground/80">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Watch for
              </div>
              <ul className="space-y-1">
                {t.risks.map((r) => (
                  <li key={r} className="text-sm flex gap-2">
                    <span className="text-muted shrink-0 mt-0.5">→</span>
                    <span className="text-muted">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted border-t border-border pt-3 mt-3 leading-relaxed">
              {t.action}
            </p>
          </div>
        ))}
      </section>

      {/* Core principles */}
      <section>
        <h2 className="text-xl font-bold mb-5">Why timing matters this much</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="card-solid rounded-xl p-5">
              <div className="font-semibold text-sm mb-1">{p.title}</div>
              <div className="text-muted text-xs leading-relaxed">{p.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Zoostr live example */}
      <section className="card-solid border border-border rounded-2xl p-6">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Live example - Zoostr
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          The first Sparkz launch waited until 50+ boosters had built a real leaderboard
          before $ZOOSTR ever existed. The token arrived after the culture - not to create
          it. 50% of every trade now flows back to those early builders by points, weekly,
          via 0xSplits.
        </p>
        <a
          href="https://zoostr.xyz/leaderboard"
          target="_blank"
          rel="noreferrer"
          className="text-accent text-sm hover:underline"
        >
          See the Zoostr leaderboard →
        </a>
      </section>

      {/* CTAs */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/advisor"
          className="btn-spark px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          🎯 Ask the advisor
        </Link>
        <Link
          href="/start"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          🔥 Open a Hearth
        </Link>
        <Link
          href="/split-wizard"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          🪄 Split-sheet wizard
        </Link>
        <Link
          href="/economics"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          📊 Fee economics
        </Link>
      </section>
    </main>
  );
}

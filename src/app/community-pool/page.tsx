import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const OG = `${BASE}/api/og?title=${encodeURIComponent("Community Pool")}&subtitle=${encodeURIComponent("How backers earn from every trade")}`;

export const metadata: Metadata = {
  title: "Community Pool - Sparkz",
  description:
    "The Sparkz community pool: backers earn a proportional share of trading fees via 0xSplits. Pull model - claim at splits.org, no deadline, no auto-payout.",
  openGraph: {
    title: "Community Pool - Sparkz",
    description:
      "Contribution → points → fee share. Every trade generates fees that flow to the 0xSplits community pool. Backers claim their proportional share at splits.org - pull model, no deadline.",
    url: `${BASE}/community-pool`,
    images: [{ url: OG, width: 1200, height: 630, alt: "Community Pool - Sparkz" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Pool - Sparkz",
    description: "Contribution → points → fee share. Claim at splits.org.",
    images: [OG],
  },
  other: {
    "fc:miniapp": "true",
    "fc:frame": "vNext",
    "fc:frame:image": OG,
    "fc:frame:button:1": "🔥 Start a Hearth",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${BASE}/start`,
    "fc:frame:button:2": "📊 See the split",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${BASE}/economics`,
  },
};

const HOW_IT_WORKS = [
  {
    n: "1",
    icon: "⚡",
    title: "Contribute to the Hearth",
    body: "Boost, back, remix, or participate. Every action earns points on the leaderboard. Holding the token earns nothing - contribution earns the fee share.",
  },
  {
    n: "2",
    icon: "📊",
    title: "Weekly snapshot",
    body: "ZOL runs a weekly leaderboard snapshot. Your proportional share of the community pool is calculated from your points vs. total points across all contributors.",
  },
  {
    n: "3",
    icon: "🔄",
    title: "0xSplits weights updated",
    body: "The snapshot updates the allocation weights in the 0xSplits contract. Fees that accumulated since the last update are now claimable at the new proportions.",
  },
  {
    n: "4",
    icon: "💰",
    title: "Claim at splits.org",
    body: "Pull model - you claim your share when you want at splits.org. No deadline. No auto-payout. Unclaimed fees accumulate until you claim. No minimum.",
  },
];

const FACTS = [
  { label: "Default pool size", value: "1% of creator fee tier" },
  { label: "Adjustable by creator", value: "Yes - must sum to 100% with creator + treasury" },
  { label: "Minimum pool", value: "1% (floor - extraction guardrail)" },
  { label: "Distribution method", value: "0xSplits contract - pull model" },
  { label: "Claim interface", value: "splits.org" },
  { label: "Claim deadline", value: "None - accumulates indefinitely" },
  { label: "Auto-payout", value: "No - pull, not push" },
  { label: "Eligibility metric", value: "Leaderboard points (contribution-weighted)" },
  { label: "Update cadence", value: "Weekly snapshot → 0xSplits weight update" },
  { label: "Zoostr pool size", value: "50% (community-first Hearth)" },
];

const GUARDRAILS = [
  {
    rule: "Holding ≠ contribution",
    detail:
      "Owning the token earns optionality (you can trade it). Contributing earns fee share. A whale who holds but never participates earns nothing from the community pool.",
  },
  {
    rule: "1% floor - always",
    detail:
      "Every Sparkz Hearth keeps at least 1% of the fee tier for the community pool. Creators can raise it. They cannot eliminate it.",
  },
  {
    rule: "Pull, not push",
    detail:
      "Fees do not land in your wallet automatically. You claim at splits.org when ready. This removes the claim that there are guaranteed earnings.",
  },
  {
    rule: "Points reset = fairness reset",
    detail:
      "If a creator resets the leaderboard, the historical point accumulation clears. Old splits are already locked; only future snapshots use new points.",
  },
];

export default function CommunityPoolPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 space-y-14">
      {/* Header */}
      <section>
        <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wider">
          Sparkz economics
        </p>
        <h1 className="text-4xl font-bold mb-4">Community Pool</h1>
        <p className="text-muted text-lg leading-relaxed">
          Every Sparkz Hearth reserves a share of its trading fees for the people who
          actually built the culture. That share lives in a 0xSplits contract. Contributors
          claim their proportional cut at splits.org - no auto-payout, no deadline, no
          minimum.
        </p>
      </section>

      {/* Default split visual */}
      <section className="card-solid border border-border rounded-2xl p-6">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          Default split (1/1/98)
        </div>
        <div className="flex h-5 w-full overflow-hidden rounded-full border border-border mb-4">
          <div className="bg-accent" style={{ width: "98%" }} title="Creator - 98%" />
          <div className="bg-foreground/40" style={{ width: "1%" }} title="Community pool - 1%" />
          <div className="bg-muted/30" style={{ width: "1%" }} title="Treasury - 1%" />
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            98% creator
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-foreground/40" />
            1% community pool
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-muted/30" />
            1% treasury
          </span>
        </div>
        <p className="text-xs text-muted mt-4 leading-relaxed">
          Creator can raise the community pool - e.g. Zoostr chose 50%. Floor is 1% and
          cannot be removed. All percentages must sum to 100.
        </p>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-xl font-bold mb-5">How it works</h2>
        <div className="space-y-4">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.n} className="card-solid border border-border rounded-xl p-5 flex gap-4">
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div className="text-lg">{s.icon}</div>
                <div className="text-accent font-black text-sm">{s.n}</div>
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">{s.title}</div>
                <div className="text-muted text-xs leading-relaxed">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facts table */}
      <section>
        <h2 className="text-xl font-bold mb-5">Pool facts</h2>
        <div className="card-solid border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {FACTS.map((f, i) => (
                <tr
                  key={f.label}
                  className={i % 2 === 0 ? "bg-transparent" : "bg-foreground/[0.02]"}
                >
                  <td className="px-4 py-3 text-muted text-xs font-medium w-1/2">
                    {f.label}
                  </td>
                  <td className="px-4 py-3 text-foreground/80 text-xs">{f.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Guardrails */}
      <section>
        <h2 className="text-xl font-bold mb-2">Guardrails</h2>
        <p className="text-muted text-sm mb-5">
          The community pool has hard rules that protect contributors from extraction.
        </p>
        <div className="space-y-3">
          {GUARDRAILS.map((g) => (
            <div key={g.rule} className="card-solid border border-border rounded-xl p-4">
              <div className="font-semibold text-sm mb-1">{g.rule}</div>
              <div className="text-muted text-xs leading-relaxed">{g.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Zoostr live example */}
      <section className="card-solid border border-border rounded-2xl p-6">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Live example - Zoostr community pool
        </div>
        <div className="flex h-5 w-full overflow-hidden rounded-full border border-border mb-4">
          <div className="bg-foreground/40" style={{ width: "50%" }} title="Community pool - 50%" />
          <div className="bg-accent" style={{ width: "25%" }} title="Creator + ops - 25%" />
          <div className="bg-muted/30" style={{ width: "25%" }} title="Treasury - 25%" />
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted mb-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-foreground/40" />
            50% community
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            25% creator + ops
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-muted/30" />
            25% treasury
          </span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          Zoostr chose a community-first split: 50% of all $ZOOSTR trading fees go to the
          community pool. Boosters earn points by liking ZABAL casts via Boostr. Weekly
          snapshot → 0xSplits update → claim at splits.org.
        </p>
        <a
          href="https://zoostr.xyz/leaderboard"
          target="_blank"
          rel="noreferrer"
          className="text-accent text-sm hover:underline"
        >
          Zoostr leaderboard → zoostr.xyz/leaderboard ↗
        </a>
      </section>

      {/* CTAs */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/start"
          className="btn-spark px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          🔥 Start a Hearth
        </Link>
        <Link
          href="/economics"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          📐 Full economics
        </Link>
        <Link
          href="/split-wizard"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          🪄 Split wizard
        </Link>
        <Link
          href="/advisor"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          💬 Ask the advisor
        </Link>
      </section>
    </main>
  );
}

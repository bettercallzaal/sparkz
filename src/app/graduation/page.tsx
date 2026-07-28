import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const OG = `${BASE}/api/og?title=${encodeURIComponent("Capsule Graduation")}&subtitle=${encodeURIComponent("Spark → Tokenized — when and how")}`;

export const metadata: Metadata = {
  title: "Capsule Graduation — Sparkz",
  description:
    "When a Sparkz Capsule graduates from Spark to Tokenized: the triggers, the steps, what changes, what doesn't. Token is optional. Culture comes first.",
  openGraph: {
    title: "Capsule Graduation — Sparkz",
    description:
      "Spark → Tokenized: the community signals readiness, the creator launches on Clanker, fees flow via 0xSplits. Token is optional. Culture first.",
    url: `${BASE}/graduation`,
    images: [{ url: OG, width: 1200, height: 630, alt: "Capsule Graduation — Sparkz" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capsule Graduation — Sparkz",
    description: "When and how a Spark graduates to a tokenized community.",
    images: [OG],
  },
  other: {
    "fc:miniapp": "true",
    "fc:frame": "vNext",
    "fc:frame:image": OG,
    "fc:frame:button:1": "🔥 Start a Capsule",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${BASE}/start`,
    "fc:frame:button:2": "🪄 Split wizard",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${BASE}/split-wizard`,
  },
};

const TRIGGERS = [
  {
    label: "Community pull",
    desc: "Backers and contributors are actively asking for a way to participate economically. The demand is organic, not manufactured.",
    signal: true,
  },
  {
    label: "Proven leaderboard",
    desc: "30+ consistent contributors with a real points history. The leaderboard has been running for ≥4 weeks.",
    signal: true,
  },
  {
    label: "0xSplits config locked",
    desc: "Every collaborator has signed off on their split percentage. The split-sheet is final and ready to deploy to 0xSplits.",
    signal: true,
  },
  {
    label: "ZAO review complete",
    desc: "If the Capsule was self-serve: ZAO vetting is complete or waived for vetted creators. ZAO-vetted Capsules can graduate without a new review.",
    signal: true,
  },
];

const DONT_TRIGGER = [
  {
    label: "Price pressure",
    desc: "\"Other projects launched their token\" is not a graduation trigger. Culture readiness is the trigger.",
  },
  {
    label: "Small backer count",
    desc: "Fewer than 10 consistent contributors means the leaderboard pool would go to almost no one. Wait.",
  },
  {
    label: "No split-sheet",
    desc: "Launching without a 0xSplits config means retroactive splits — historically the cause of 70%+ of creator revenue disputes.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "ZAO review or waiver",
    body: "ZAO confirms the Capsule meets the graduation checklist: real community, locked split, no red flags. ZAO-vetted Capsules get expedited review.",
    icon: "⬡",
  },
  {
    n: "2",
    title: "Split-wizard: lock the config",
    body: "Every collaborator's wallet, role, and percentage goes into the split-wizard. Output: 0xSplits JSON + IPFS-attestable markdown. This is the permanent record.",
    icon: "🪄",
  },
  {
    n: "3",
    title: "Deploy 0xSplits contract",
    body: "The creator deploys the 0xSplits contract on Base. This is the fee recipient address for the Clanker launch. One human click — ZOL does not deploy.",
    icon: "🔐",
  },
  {
    n: "4",
    title: "Clanker launch",
    body: "Creator launches on Clanker (1% fee tier, fee recipient = the 0xSplits address). Token goes live. This is the point of no return — Clanker rewardBps are immutable.",
    icon: "🚀",
  },
  {
    n: "5",
    title: "Weekly snapshot begins",
    body: "ZOL runs a weekly leaderboard snapshot → updates 0xSplits weights → community can claim their share at splits.org. Pull model: no deadline, no auto-payout.",
    icon: "📊",
  },
];

const WHAT_CHANGES = [
  "Token is now live and tradeable on Base",
  "Every trade generates fees that flow to the 0xSplits contract",
  "Weekly snapshot + weight update begins",
  "Community earns from every trade, proportional to leaderboard points",
  "Capsule status changes from Spark → Tokenized",
];

const WHAT_DOESNT_CHANGE = [
  "The Capsule identity, name, and bio",
  "The existing backer and boost history",
  "The Meme Engine and receipt cadence",
  "The community leaderboard (keeps accumulating)",
  "The creator's ability to adjust the 0xSplits config",
  "ZAO's aligned stake — it graduates with the Capsule",
];

export default function GraduationPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 space-y-14">
      {/* Header */}
      <section>
        <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wider">
          Capsule lifecycle
        </p>
        <h1 className="text-4xl font-bold mb-4">Capsule Graduation</h1>
        <p className="text-muted text-lg leading-relaxed">
          Graduation is when a Spark becomes Tokenized — when the community signals it&rsquo;s
          ready for an on-chain economic layer. Token is optional, later, and community-pulled.
          Culture comes before the coin, always.
        </p>
      </section>

      {/* Graduate when */}
      <section>
        <h2 className="text-xl font-bold mb-5">Graduate when all four are true</h2>
        <div className="space-y-3">
          {TRIGGERS.map((t) => (
            <div key={t.label} className="card-solid border border-accent/20 rounded-xl p-5 flex gap-4">
              <span className="text-accent font-black text-sm shrink-0 mt-0.5">✓</span>
              <div>
                <div className="font-semibold text-sm mb-1">{t.label}</div>
                <div className="text-muted text-xs leading-relaxed">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Don't graduate when */}
      <section>
        <h2 className="text-xl font-bold mb-2">Don&rsquo;t graduate if</h2>
        <p className="text-muted text-sm mb-4">
          These are common premature graduation traps that Sparkz is designed to prevent.
        </p>
        <div className="space-y-3">
          {DONT_TRIGGER.map((d) => (
            <div key={d.label} className="card-solid border border-border rounded-xl p-4 flex gap-4">
              <span className="text-muted font-black text-sm shrink-0 mt-0.5">✗</span>
              <div>
                <div className="font-semibold text-sm mb-1">{d.label}</div>
                <div className="text-muted text-xs leading-relaxed">{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-xl font-bold mb-5">The 5 graduation steps</h2>
        <div className="space-y-4">
          {STEPS.map((s) => (
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

      {/* What changes vs doesn't */}
      <section>
        <h2 className="text-xl font-bold mb-5">What changes. What doesn&rsquo;t.</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card-solid border border-accent/20 rounded-xl p-5">
            <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
              Changes at graduation
            </div>
            <ul className="space-y-2">
              {WHAT_CHANGES.map((c) => (
                <li key={c} className="flex gap-2 text-xs">
                  <span className="text-accent shrink-0">+</span>
                  <span className="text-foreground/80">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-solid border border-border rounded-xl p-5">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Doesn&rsquo;t change
            </div>
            <ul className="space-y-2">
              {WHAT_DOESNT_CHANGE.map((d) => (
                <li key={d} className="flex gap-2 text-xs">
                  <span className="text-muted shrink-0">→</span>
                  <span className="text-muted">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Zoostr example */}
      <section className="card-solid border border-border rounded-2xl p-6">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Live example — Zoostr graduation
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          Zoostr graduated after 50+ boosters had built a real leaderboard over several weeks.
          The community was pulling for economic participation before the token was even announced.
          0xSplits was deployed first; Clanker came second. The 50/25/25 split was locked before
          launch day.
        </p>
        <a
          href="https://zoostr.xyz/token"
          target="_blank"
          rel="noreferrer"
          className="text-accent text-sm hover:underline"
        >
          $ZOOSTR token details → zoostr.xyz/token ↗
        </a>
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
        <Link
          href="/capsule"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          📦 What is a Capsule?
        </Link>
      </section>
    </main>
  );
}

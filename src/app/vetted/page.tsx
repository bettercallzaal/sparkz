import Link from "next/link";
import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";

export const dynamic = "force-static";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Vetted by ZAO — Sparkz",
  description:
    "ZAO backs a small number of creators per quarter — 1 of 50 slots. Vetted launches get the ZAO badge, scarce drop prestige, and ZOL marketing support end to end.",
  openGraph: {
    title: "Vetted by ZAO — Sparkz",
    description: "1 of 50 slots per quarter. Not every launch gets one.",
    url: `${BASE}/vetted`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vetted by ZAO — Sparkz",
    description: "1 of 50 slots per quarter. Not every launch gets one.",
  },
};

const WHAT_YOU_GET = [
  {
    icon: "🏅",
    title: '"Vetted by ZAO" badge',
    body: "Shows on your Capsule page, your token, and your Farcaster profile. Signals: ZAO reviewed this, backed it, and stands behind the quality.",
  },
  {
    icon: "🔒",
    title: "Scarce slot (1 of 50/quarter)",
    body: "ZAO limits to 50 launches per quarter. Scarcity is real. If you get a slot, it means something — and your community knows it.",
  },
  {
    icon: "⚡",
    title: "ZOL marketing support",
    body: "ZOL (ZAO's AI agent) drafts your full launch: 5-cast Farcaster thread, X thread, deploy config, weekly receipts. You review and approve everything before it posts.",
  },
  {
    icon: "🤝",
    title: "Aligned ZAO stake",
    body: "ZAO takes a small locked token allocation (not a fee cut) and holds for 12 months. If you win, ZAO wins. That's the alignment model.",
  },
  {
    icon: "🛠",
    title: "Full Sparkz stack",
    body: "The 0xSplits contract, the split wizard, the weekly snapshot, the leaderboard, the receipts — all set up and ready before you launch.",
  },
];

const CRITERIA = [
  "An existing community with real engagement (leaderboard, NFT collection, Discord activity, Boostr points)",
  "A clear plan for what backers enjoy today — not promises about future value",
  "A creator who understands that the token (if any) is plumbing, not the pitch",
  "Willingness to have the split config, fee breakdown, and ZAO stake publicly disclosed",
  "A project where multi-recipient splits actually make sense (collab, crowdfund, or community-backed)",
];

export default function VettedPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      {/* Hero */}
      <section className="pt-14 pb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent">
          🏅 Vetted by ZAO
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Not every launch<br />gets a slot.
        </h1>
        <p className="mt-4 text-lg text-muted">
          ZAO backs 50 launches per quarter — selected for real community, honest economics, and a split that makes sense. Vetted projects get the badge, scarce-slot prestige, and ZOL support end to end.
        </p>
      </section>

      {/* What you get */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          What you get
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {WHAT_YOU_GET.map((item) => (
            <div key={item.title} className="glass p-4">
              <div className="mb-2 text-2xl">{item.icon}</div>
              <div className="mb-1 font-semibold text-sm">{item.title}</div>
              <p className="text-xs leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Criteria */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          What ZAO looks for
        </h2>
        <ul className="space-y-3">
          {CRITERIA.map((c) => (
            <li key={c} className="flex gap-3 text-sm text-muted">
              <span className="mt-0.5 shrink-0 text-accent">→</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Live example */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          First vetted launch
        </h2>
        <div className="card-solid p-5">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <span className="font-semibold">Zoostr ($ZOOSTR)</span>
            <span className="ml-auto rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 text-xs font-medium text-accent">
              🏅 Vetted
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">
            ZABAL × Boostr. 34+ boosters built the empire before any token existed. The token pays them back — 50% of every trade fee to the leaderboard by points. Recipients claim at splits.org, no deadline.
          </p>
          <a
            href="https://zoostr.xyz"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            zoostr.xyz ↗
          </a>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="border-t border-border py-8">
        <div className="card-solid p-5 sm:p-6">
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">
            Apply for a slot
          </div>
          <h3 className="mb-2 text-lg font-semibold">Think you&apos;re ready?</h3>
          <p className="mb-4 text-sm text-muted">
            Drop your Farcaster handle, what you&apos;re building, and your existing community proof (leaderboard, Discord, Boostr, NFT holders). ZAO reviews every quarter. 50 slots — that&apos;s it.
          </p>
          <a
            href="https://warpcast.com/zaal"
            target="_blank"
            rel="noreferrer"
            className="btn-spark inline-block rounded-lg px-5 py-2 text-sm font-semibold"
          >
            Apply on Warpcast →
          </a>
          <p className="mt-3 text-xs text-muted/60">
            No form to fill. DM @zaal on Warpcast with your project and community proof.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <section className="border-t border-border py-8">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/examples" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Spark examples</div>
            <div className="text-xs text-muted">7 tokenless starting points</div>
          </Link>
          <Link href="/advisor" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Split advisor</div>
            <div className="text-xs text-muted">Get your recommended split config</div>
          </Link>
          <Link href="/start" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Light a spark</div>
            <div className="text-xs text-muted">Start without waiting for vetting</div>
          </Link>
          <Link href="/explore" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Explore capsules</div>
            <div className="text-xs text-muted">See the full ecosystem</div>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-xs text-muted">
        Sparkz — back the work, build the collective, earn transparently.
      </footer>
    </main>
  );
}

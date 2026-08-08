import Link from "next/link";
import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";

export const dynamic = "force-static";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Backing tiers - Sparkz",
  description:
    "Tokenless backing tiers for creators. Fans back your work at $5, $25, or $100 with a card - no wallet, no gas. They earn leaderboard weight. You earn consistent support.",
  openGraph: {
    title: "Backing tiers - Sparkz",
    description:
      "Tokenless backing tiers. Fans back with a card. No wallet needed.",
    url: `${BASE}/patronage`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backing tiers - Sparkz",
    description: "Tokenless backing tiers. No wallet needed.",
  },
};

const TIERS = [
  {
    label: "Spark",
    price: "$5",
    description: "Get in the door. Leaderboard entry, community recognition.",
    perks: [
      "Leaderboard entry - points start accumulating",
      "Community recognition badge",
      "Weekly receipt notifications",
    ],
    highlight: false,
  },
  {
    label: "Booster",
    price: "$25",
    description: "The real deal. Boosted leaderboard weight + early access.",
    perks: [
      "Everything in Spark",
      "Boosted leaderboard weight (5× multiplier)",
      "Early access to new creator launches",
      "ZAO-backed community Discord access",
    ],
    highlight: true,
  },
  {
    label: "Patron",
    price: "$100",
    description: "Top-tier backing. Maximum weight. Direct access to ZAO.",
    perks: [
      "Everything in Booster",
      "Maximum leaderboard weight (20× multiplier)",
      "Direct ZAO advisory channel",
      "\"ZAO Patron\" label on your profile",
    ],
    highlight: false,
  },
];

const HOW_IT_WORKS = [
  {
    n: "1",
    title: "Set your tiers",
    body: "Configure $5, $25, and $100 backing options. Name them, write the perks, set the leaderboard weight multipliers.",
  },
  {
    n: "2",
    title: "Fans back with a card",
    body: "One-time backing - no wallet, no gas, no crypto required. Fans pay with a credit or debit card. V1 is one-time; recurring billing is v2.",
  },
  {
    n: "3",
    title: "Points accumulate",
    body: "Each backing tier earns leaderboard weight. The more someone backs, the heavier their weight in the community pool.",
  },
  {
    n: "4",
    title: "Fee share via 0xSplits",
    body: "Community pool fees flow through a 0xSplits contract. Backers claim their share at splits.org - pull model, no deadline, no auto-payout.",
  },
];

export default function PatronagePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      {/* Hero */}
      <section className="pt-14 pb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
          Backing tiers
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Tokenless backing.<br />No wallet needed.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Fans back your work at $5, $25, or $100 with a card. They earn leaderboard weight. You earn consistent support. No token required to start.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-border px-2 py-0.5">✓ No wallet or gas for fans</span>
          <span className="rounded-full border border-border px-2 py-0.5">✓ V1 is one-time backing</span>
          <span className="rounded-full border border-border px-2 py-0.5">✓ Leaderboard weight earned</span>
        </div>
      </section>

      {/* Tiers */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          Default tier structure
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.label}
              className={`flex flex-col gap-3 rounded-xl border p-5 ${
                t.highlight
                  ? "border-accent/40 bg-accent/5"
                  : "border-border glass"
              }`}
            >
              {t.highlight && (
                <span className="self-start rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  Most popular
                </span>
              )}
              <div>
                <div className="text-lg font-semibold">{t.label}</div>
                <div className="text-2xl font-bold text-accent">{t.price}</div>
                <p className="mt-1 text-xs text-muted">{t.description}</p>
              </div>
              <ul className="space-y-1.5">
                {t.perks.map((p) => (
                  <li key={p} className="flex gap-1.5 text-xs text-muted">
                    <span className="mt-0.5 text-accent">→</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted/60">
          These are the default Sparkz tiers. Fully customizable per project.
        </p>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          How it works
        </h2>
        <div className="space-y-3">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.n} className="glass flex gap-4 p-4">
              <div className="w-6 shrink-0 text-sm font-bold text-accent">{s.n}</div>
              <div>
                <div className="mb-1 font-semibold text-sm">{s.title}</div>
                <p className="text-xs leading-relaxed text-muted">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live example */}
      <section className="border-t border-border py-8">
        <div className="card-solid p-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">
            Live example
          </div>
          <h3 className="mb-2 text-base font-semibold">Zoostr - the first backing tier launch</h3>
          <p className="mb-3 text-sm text-muted">
            ZABAL set up $5/$25/$100 backing tiers before $ZOOSTR existed. 34+ boosters built the empire. When the token launched, their leaderboard weight translated to 50% of every trading fee - claimable at splits.org, no deadline.
          </p>
          <a
            href="https://zoostr.xyz/back"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm text-accent hover:underline"
          >
            See it at zoostr.xyz/back ↗
          </a>
        </div>
      </section>

      {/* CTAs */}
      <section className="border-t border-border py-8">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/start" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Light a spark</div>
            <div className="text-xs text-muted">Open your Hearth - no token needed</div>
          </Link>
          <Link href="/advisor" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Configure your split</div>
            <div className="text-xs text-muted">3 questions → recommended split config</div>
          </Link>
          <Link href="/examples" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Solo patronage template</div>
            <div className="text-xs text-muted">See the full solo creator example</div>
          </Link>
          <Link href="/vetted" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Get vetted by ZAO</div>
            <div className="text-xs text-muted">50 slots/quarter, badge + ZOL support</div>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-xs text-muted">
        V1 checkout is one-time. Recurring billing is v2. Fee share via 0xSplits - claim at splits.org, no deadline.
      </footer>
    </main>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";

export const dynamic = "force-static";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Economics - Sparkz",
  description:
    "The Sparkz default: 98% to the creator's distribution wallet, 1% upkeep to the treasury, 1% to the community pool. Fully adjustable. Transparent on-chain via 0xSplits.",
  openGraph: {
    title: "Economics - Sparkz",
    description:
      "1 / 1 / 98 - creator keeps almost everything. Fully adjustable, transparent on-chain.",
    url: `${BASE}/economics`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Economics - Sparkz",
    description: "1 / 1 / 98 default. Creator keeps 98%. Transparent via 0xSplits.",
  },
};

const SLICES = [
  {
    pct: "98%",
    label: "Creator distribution wallet",
    detail:
      "Flows into a 0xSplits contract - routes to the creator, co-writers, producers, band, any collaborators you configure. Claim anytime at splits.org, no deadline.",
    color: "text-accent",
    bar: "bg-accent",
    flex: "flex-[98]",
  },
  {
    pct: "1%",
    label: "Community pool",
    detail:
      "Distributed to backers by contribution weight. Fans who back the work earn proportional fee share. Claim at splits.org, pull model, no deadline.",
    color: "text-foreground",
    bar: "bg-foreground/60",
    flex: "flex-[1]",
  },
  {
    pct: "1%",
    label: "Sparkz treasury (upkeep)",
    detail:
      "Funds platform compute: AI advisor, treasury solvency, ZAO alignment. Non-technical creators draw from this - no Anthropic key required. Power users bring their own key (BYOK) to bypass.",
    color: "text-muted",
    bar: "bg-muted/40",
    flex: "flex-[1]",
  },
];

const PRINCIPLES = [
  {
    title: "Creator-first by default",
    body: "98% flows directly to the creator's distribution wallet. The platform takes nothing from that 98% - it's yours and your collaborators'.",
  },
  {
    title: "Fully adjustable",
    body: "The 1/1/98 split is a starting point, not a lock-in. You can push more to the community pool, less to treasury, add new collaborator slices - the AI advisor pre-fills a recommended config based on your situation.",
  },
  {
    title: "Extraction test",
    body: "Every split must pass the extraction test: a skeptical Farcaster user should not be able to call it a skim. If the numbers feel off, adjust before you launch. The advisor flags this.",
  },
  {
    title: "Treasury sustainability",
    body: "The 1% upkeep floor funds AI compute. This is the loop: fees → treasury → compute → non-technical creators use the AI advisor for free → more creators launch → more fees. Seed it early.",
  },
];

export default function EconomicsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      {/* Hero */}
      <section className="pt-14 pb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
          Fee model
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          1 / 1 / 98
        </h1>
        <p className="mt-4 text-lg text-muted">
          The Sparkz default split. Creator keeps 98%. Community pool earns 1%. Platform upkeep takes 1%. Fully adjustable - the AI advisor configures your specific numbers.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-border px-2 py-0.5">✓ Transparent on-chain via 0xSplits</span>
          <span className="rounded-full border border-border px-2 py-0.5">✓ Pull model - claim anytime</span>
          <span className="rounded-full border border-border px-2 py-0.5">✓ No auto-payout, no deadline</span>
        </div>
      </section>

      {/* Visual split bar */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          Default allocation
        </h2>
        <div className="flex h-6 w-full overflow-hidden rounded-full border border-border">
          <div className="bg-accent flex-[98]" title="98% creator" />
          <div className="bg-foreground/50 flex-[1]" title="1% community" />
          <div className="bg-muted/30 flex-[1]" title="1% treasury" />
        </div>
        <div className="mt-6 space-y-4">
          {SLICES.map((s) => (
            <div key={s.label} className="glass flex gap-4 p-4">
              <div className={`w-10 shrink-0 text-2xl font-bold ${s.color}`}>{s.pct}</div>
              <div>
                <div className={`mb-1 font-semibold text-sm ${s.color}`}>{s.label}</div>
                <p className="text-xs leading-relaxed text-muted">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          Design principles
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="glass p-4">
              <div className="mb-1 font-semibold text-sm">{p.title}</div>
              <p className="text-xs leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How 0xSplits works */}
      <section className="border-t border-border py-8">
        <div className="card-solid p-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">
            How claiming works
          </div>
          <h3 className="mb-2 text-base font-semibold">Pull model via 0xSplits</h3>
          <p className="mb-3 text-sm text-muted">
            Trading fees flow into a 0xSplits contract on Base. Funds accumulate there - nothing auto-routes to personal wallets. When you want your share, go to{" "}
            <a
              href="https://splits.org"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              splits.org
            </a>
            , connect your wallet, and claim. No deadline. No permission needed.
          </p>
          <p className="text-xs text-muted/70">
            This is intentional: pull model = no surprise airdrops, no gas-eating auto-distributions, full audit trail on-chain.
          </p>
        </div>
      </section>

      {/* CTAs */}
      <section className="border-t border-border py-8">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/advisor" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Configure your split</div>
            <div className="text-xs text-muted">3 questions → your recommended percentages</div>
          </Link>
          <Link href="/split-wizard" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Split-sheet wizard</div>
            <div className="text-xs text-muted">Add collaborators, export to 0xSplits JSON</div>
          </Link>
          <Link href="/examples" className="glass glass-hover p-3">
            <div className="font-medium text-sm">See real splits</div>
            <div className="text-xs text-muted">7 templates - collab, crowdfund, patronage</div>
          </Link>
          <Link href="/patronage" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Community pool → backers</div>
            <div className="text-xs text-muted">How fans earn from the 1% community slice</div>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-xs text-muted">
        1/1/98 is the default. All percentages are fully adjustable. Must sum to 100 and pass the extraction test. Fee share via 0xSplits - claim at splits.org, no deadline, pull model.
      </footer>
    </main>
  );
}

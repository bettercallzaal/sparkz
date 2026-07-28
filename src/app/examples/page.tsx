import Link from "next/link";
import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";

export const dynamic = "force-static";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Spark examples — Sparkz",
  description:
    "7 spark templates: community leaderboard, music collab, group crowdfund, solo patronage, PFP community, podcast splits, and gaming clan. Each shows the no-token starting point, split config, and when (if ever) to add a token.",
  openGraph: {
    title: "Spark examples — Sparkz",
    description:
      "7 templates. Start tokenless. Build real community.",
    url: `${BASE}/examples`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark examples — Sparkz",
    description: "7 templates. Start tokenless. Build real community.",
  },
};

type TokenPath = "now" | "later" | "never";

type SparkExample = {
  emoji: string;
  title: string;
  tagline: string;
  noTokenAction: string;
  splitSummary: string;
  tokenPath: TokenPath;
  tokenNote: string;
  feeModel: "low" | "medium" | "high";
};

const TOKEN_PATH: Record<TokenPath, { label: string; classes: string }> = {
  now: { label: "Token ready now", classes: "text-accent border-accent/30 bg-accent/5" },
  later: { label: "Build first, token later", classes: "text-foreground border-border bg-surface" },
  never: { label: "Patronage only (no token)", classes: "text-muted border-border/50 bg-transparent" },
};

const EXAMPLES: SparkExample[] = [
  {
    emoji: "🏆",
    title: "Community leaderboard",
    tagline: "Superfans earn fee share just by showing up.",
    noTokenAction:
      "Start the leaderboard now — no token needed. Your top fans see their ranking and projected earnings. The leaderboard is live; the token is optional.",
    splitSummary: "50% community pool / 25% creator / 25% treasury — evolves from a creator-first 97/2/1 default as the leaderboard proves itself.",
    tokenPath: "later",
    tokenNote: "Prove 30+ real boosters for 4+ weeks. Then a token makes the leaderboard pay.",
    feeModel: "low",
  },
  {
    emoji: "🎵",
    title: "Music collab",
    tagline: "Two artists, one split — both incentivized to share.",
    noTokenAction:
      "Use the split advisor to lock roles and percentages before recording is done. Both collaborators sign off. When you launch, the split is already agreed and wired.",
    splitSummary: "40% community / 40% creator pool (divided by role: Artist A / Artist B / Producer) / 20% treasury.",
    tokenPath: "now",
    tokenNote: "Both artists' fan bases drive demand from day one — the collab economics work with a token.",
    feeModel: "medium",
  },
  {
    emoji: "🌊",
    title: "Group crowdfund",
    tagline: "Fund a project together. Proposers vote, contributors earn.",
    noTokenAction:
      "Create a Capsule for the initiative. Crowdfunders back it before any token exists. Their contribution is the proof; the token (if ever) is the payoff.",
    splitSummary: "60% community pool (proportional to crowdfund contribution) / 20% creator / 20% treasury.",
    tokenPath: "later",
    tokenNote: "Hit the funding target first. The token makes on-chain governance possible — but isn't required.",
    feeModel: "high",
  },
  {
    emoji: "🎙️",
    title: "Solo patronage",
    tagline: "One creator, fans back with a card — no wallet required.",
    noTokenAction:
      "Open a Capsule. Fans back your work at any tier. No wallet, no gas. Start collecting support before any on-chain infrastructure is needed.",
    splitSummary: "98% creator / 1% community / 1% treasury — standard creator-first default.",
    tokenPath: "never",
    tokenNote: "Many solo creators never need a token. The patronage relationship is the whole value.",
    feeModel: "low",
  },
  {
    emoji: "🖼️",
    title: "PFP / NFT community",
    tagline: "Visual identity first. Token if the community asks for it.",
    noTokenAction:
      "Launch the Capsule with the PFP collection as the identity. Backers get early access to drops. No on-chain launch required day one.",
    splitSummary: "45% community / 40% creator / 15% treasury — heavy community weighting since holders are the audience.",
    tokenPath: "later",
    tokenNote: "When the collection has proven collector demand, a token rewards the earliest supporters.",
    feeModel: "medium",
  },
  {
    emoji: "📡",
    title: "Podcast / newsletter split",
    tagline: "Co-hosts and editors, split documented before episode one.",
    noTokenAction:
      "Document the production split (co-host A / co-host B / editor) in the advisor before publishing. Everyone sees their share. Disputes die before they start.",
    splitSummary: "50% creator pool (divided by role) / 30% community / 20% treasury.",
    tokenPath: "never",
    tokenNote: "Most media projects stay tokenless. The split document is the product.",
    feeModel: "low",
  },
  {
    emoji: "🎮",
    title: "Gaming clan",
    tagline: "Competitive community — rewards for play, not just holding.",
    noTokenAction:
      "Publish a leaderboard by match results or ranking. Top players see projected earnings. No token required to prove the competitive culture is real.",
    splitSummary: "55% community pool (by rank points) / 25% creator / 20% treasury.",
    tokenPath: "later",
    tokenNote: "When the tournament circuit is established, a token lets the best players earn transparently.",
    feeModel: "medium",
  },
];

export default function ExamplesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4">
      <section className="pt-14 pb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
          Spark examples
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {EXAMPLES.length} ways to start<br />with a spark.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Each template shows what you can do <em>before</em> any token exists, how the split is configured, and when — or if — a token ever makes sense. Start from the one that fits, then customize in the advisor.
        </p>
        <Link href="/advisor" className="mt-5 inline-block btn-spark rounded-lg px-5 py-2 text-sm font-semibold">
          Get my recommended split →
        </Link>
      </section>

      <section className="border-t border-border py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((ex) => {
            const tp = TOKEN_PATH[ex.tokenPath];
            return (
              <div key={ex.title} className="glass flex flex-col gap-3 p-5">
                <div className="text-3xl">{ex.emoji}</div>
                <div>
                  <div className="font-semibold leading-tight">{ex.title}</div>
                  <div className="mt-1 text-sm text-muted">{ex.tagline}</div>
                </div>
                <p className="text-xs leading-relaxed text-muted">{ex.noTokenAction}</p>
                <div className="mt-auto space-y-2">
                  <div className="text-xs text-muted/70">
                    <span className="font-medium text-foreground/80">Split: </span>
                    {ex.splitSummary}
                  </div>
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${tp.classes}`}
                  >
                    {tp.label}
                  </span>
                  <p className="text-xs text-muted/60 italic">{ex.tokenNote}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted/60">
          These are templates, not requirements. Customize everything in the advisor.
        </p>
      </section>

      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          The pattern across all {EXAMPLES.length}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="glass p-4">
            <div className="mb-2 font-semibold">Today (no token)</div>
            <ul className="space-y-1.5 text-sm text-muted">
              <li>→ Publish the community metric</li>
              <li>→ Show projected earnings</li>
              <li>→ Accept backing (card or on-chain)</li>
              <li>→ Set the split in the advisor</li>
            </ul>
          </div>
          <div className="glass p-4">
            <div className="mb-2 font-semibold">When momentum is proven</div>
            <ul className="space-y-1.5 text-sm text-muted">
              <li>→ Real backers, real activity</li>
              <li>→ Recurring receipts</li>
              <li>→ Contributors who keep showing up</li>
              <li>→ <em>Then</em> consider a token</li>
            </ul>
          </div>
          <div className="glass p-4">
            <div className="mb-2 font-semibold">If a token makes sense</div>
            <ul className="space-y-1.5 text-sm text-muted">
              <li>→ Launch on Clanker rail</li>
              <li>→ Fee split via 0xSplits (pull model)</li>
              <li>→ Claim at splits.org — no lockups</li>
              <li>→ Many sparks never tokenize. Fine.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-8">
        <div className="card-solid p-5 sm:p-6">
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">
            Not sure which fits you?
          </div>
          <h3 className="mb-2 text-lg font-semibold">Use the split advisor.</h3>
          <p className="mb-4 text-sm text-muted">
            Answer 3 questions — your situation, token timing, and fee preference — and get a recommended split with rationale, token advice, and a hint for the split wizard.
          </p>
          <Link href="/advisor" className="btn-spark rounded-lg px-5 py-2 text-sm font-semibold inline-block">
            Open the advisor →
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-xs text-muted">
        Sparkz — back the work, build the collective, earn transparently.
      </footer>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const OG = `${BASE}/api/og?title=${encodeURIComponent("The Sparkz Manifesto")}&subtitle=${encodeURIComponent("Generative, not extractive. Symbiotic, not parasitic.")}`;

export const metadata: Metadata = {
  title: "Manifesto — Sparkz",
  description:
    "The Sparkz cultural manifesto: start with a spark, not a token. Generative, not extractive. Symbiotic, not parasitic. Culture before coin.",
  openGraph: {
    title: "The Sparkz Manifesto",
    description:
      "Back the album, not buy a coin. Holding is not contribution. Culture before coin. Generative, not extractive. This is what Sparkz is for.",
    url: `${BASE}/manifesto`,
    images: [{ url: OG, width: 1200, height: 630, alt: "The Sparkz Manifesto" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Sparkz Manifesto",
    description: "Generative, not extractive. Symbiotic, not parasitic.",
    images: [OG],
  },
  other: {
    "fc:miniapp": "true",
    "fc:frame": "vNext",
    "fc:frame:image": OG,
    "fc:frame:button:1": "🔥 Start a Capsule",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${BASE}/start`,
    "fc:frame:button:2": "📖 Read the manifesto",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${BASE}/manifesto`,
  },
};

const PRINCIPLES = [
  {
    n: "I",
    headline: "Start with a spark, not a token.",
    body: "Every community starts as culture. A creator, a groove, a thing people want more of. The token is the economic layer the community earns access to — not the reason to exist. A Capsule opens before a token exists. Sometimes it stays that way forever. That is a success.",
  },
  {
    n: "II",
    headline: "Back the album, not buy a coin.",
    body: "When someone supports a Sparkz Capsule, they are backing the work — the catalog, the culture, the creativity. They are not buying exposure to a ticker. The moment that distinction collapses, the community breaks. Sparkz is designed to keep them separate.",
  },
  {
    n: "III",
    headline: "Contribution earns. Holding waits.",
    body: "Owning the token gives you optionality — you can trade it when you want. Contributing to the Capsule earns you fee share from the community pool. A whale who holds but never participates earns nothing from the people's cut. This is the only model that does not corrupt the culture.",
  },
  {
    n: "IV",
    headline: "Culture before price.",
    body: "Community identity comes first. Token mechanics serve the culture — not the other way around. The moment a Capsule is designed around its price chart, the culture is already gone. ZAO guardrail: any Capsule that exists to pump a token does not pass the vetting threshold.",
  },
  {
    n: "V",
    headline: "Attribution before extraction.",
    body: "Every fee flow must credit the contributor. The 0xSplits contract is not a payout mechanism — it is an attribution mechanism. Every split update is a ledger of who built what. The community pool is a recognition contract first, and a financial contract second.",
  },
  {
    n: "VI",
    headline: "Capability is not authority.",
    body: "ZOL can draft casts, propose splits, detect cultural moments, and generate receipts. ZOL cannot post, sign, or spend without a human. The AI advisor advises. The human decides. This is not a limitation — it is the only way to build a system that communities can trust.",
  },
  {
    n: "VII",
    headline: "Generative, not extractive. Symbiotic, not parasitic.",
    body: "Sparkz is not designed to extract value from culture. It is designed to let culture generate value for itself. The platform earns from the same pool as the community (1% treasury), so Sparkz' incentive is always aligned with community health. A dying community is a dying platform.",
  },
  {
    n: "VIII",
    headline: "Founder authority decays.",
    body: "Creator control decreases as the community matures. The creator launches, the community grows, and eventually the Capsule belongs more to the community than the creator. This is the goal. A Capsule that a creator controls forever has not achieved what Sparkz is for.",
  },
];

const WHAT_WE_ARE_NOT = [
  "A token launchpad — token is optional, not the goal",
  "A permissionless minting farm — ZAO-curated, self-serve goes through review",
  "An investment platform — a culture-backing tool, not a security",
  "A yield product — fee share, not passive income",
  "An autonomous system — ZOL advises; humans decide",
];

export default function ManifestoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 space-y-14">
      {/* Header */}
      <section>
        <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wider">
          What Sparkz is for
        </p>
        <h1 className="text-4xl font-bold mb-4">The Sparkz Manifesto</h1>
        <p className="text-muted text-xl leading-relaxed font-medium">
          Generative, not extractive. Symbiotic, not parasitic.
        </p>
      </section>

      {/* Principles */}
      <section>
        <div className="space-y-8">
          {PRINCIPLES.map((p) => (
            <div key={p.n} className="flex gap-6">
              <div className="text-accent font-black text-sm shrink-0 w-8 pt-1 opacity-60">
                {p.n}
              </div>
              <div>
                <h2 className="font-bold text-lg mb-2">{p.headline}</h2>
                <p className="text-muted text-sm leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What we are not */}
      <section className="card-solid border border-border rounded-2xl p-6">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          What Sparkz is NOT
        </div>
        <ul className="space-y-2">
          {WHAT_WE_ARE_NOT.map((w) => (
            <li key={w} className="flex gap-3 text-sm">
              <span className="text-muted shrink-0">✗</span>
              <span className="text-muted">{w}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* The framing */}
      <section>
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          The framing — use this language
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card-solid border border-accent/20 rounded-xl p-4">
            <div className="text-xs font-semibold text-accent mb-3">Say this</div>
            <ul className="space-y-1.5 text-xs">
              {[
                "Start with a spark, not a token",
                "Back the album, not buy a coin",
                "Back the work",
                "Access, not speculation",
                "Claim your share at splits.org",
                "Contribution → points → fee share",
                "Generative, not extractive",
              ].map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-accent shrink-0">→</span>
                  <span className="text-foreground/80">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-solid border border-border rounded-xl p-4">
            <div className="text-xs font-semibold text-muted mb-3">Never say</div>
            <ul className="space-y-1.5 text-xs">
              {[
                "buy / invest / moon / pump",
                "passive income / auto-payout",
                "no claiming required",
                "guaranteed",
                "holders control",
                "raise (use fund or back)",
                "permissionless minting",
              ].map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-muted shrink-0">✗</span>
                  <span className="text-muted">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Live example */}
      <section className="card-solid border border-border rounded-2xl p-6">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          The first live Capsule
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          Zoostr (ZABAL × Boostr) is the first Capsule to graduate. 50+ people showed up
          for the culture before a token existed. The community pulled. The token came
          second. 50% of every $ZOOSTR trade goes to the community pool — claimed at
          splits.org, pull model, no deadline.
        </p>
        <a
          href="https://zoostr.xyz"
          target="_blank"
          rel="noreferrer"
          className="text-accent text-sm hover:underline"
        >
          zoostr.xyz — the live empire ↗
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
          href="/capsule"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          📦 What is a Capsule?
        </Link>
        <Link
          href="/community-pool"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          💰 Community pool
        </Link>
        <Link
          href="/zao"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          ⬡ The ZAO
        </Link>
      </section>
    </main>
  );
}

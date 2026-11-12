import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const OG = `${BASE}/api/og?title=${encodeURIComponent("The Sparkz Manifesto")}&subtitle=${encodeURIComponent("Generative, not extractive. Symbiotic, not parasitic.")}`;

export const metadata: Metadata = {
  title: "Manifesto - Sparkz",
  description:
    "The Sparkz cultural manifesto: light a Hearth, grow it with sparks. Generative, not extractive. Symbiotic, not parasitic. Culture first.",
  openGraph: {
    title: "The Sparkz Manifesto",
    description:
      "Back the album, back the show. Watching is not contribution. Culture first. Generative, not extractive. This is what Sparkz is for.",
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
    "fc:frame:button:1": "Start a Hearth",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${BASE}/start`,
    "fc:frame:button:2": "Read the manifesto",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${BASE}/manifesto`,
  },
};

const PRINCIPLES = [
  {
    n: "I",
    headline: "Light a Hearth, grow it with sparks.",
    body: "Every community starts as culture. A creator, a groove, a thing people want more of. The Hearth is its home. Every show, drop and launch is a Spark that grows it. There is no finish line, only the next Spark.",
  },
  {
    n: "II",
    headline: "Back the album, back the show.",
    body: "When someone supports a Sparkz Hearth, they are backing the work - the catalog, the culture, the creativity. They are not buying exposure to anything. The moment that changes, the community breaks. Sparkz is designed to keep it that way.",
  },
  {
    n: "III",
    headline: "Contribution earns. Watching waits.",
    body: "The people who show up, help and share earn standing in the Hearth, and the onchain record shows who did the work. Standing comes from doing, never from buying in. This is the only model that does not corrupt the culture.",
  },
  {
    n: "IV",
    headline: "Culture before price.",
    body: "Community identity comes first. Every tool serves the culture - not the other way around. The moment a Hearth is designed around a price chart, the culture is already gone. ZAO guardrail: any Hearth that exists to pump something does not pass review.",
  },
  {
    n: "V",
    headline: "Attribution before extraction.",
    body: "Every fee flow must credit the contributor. The 0xSplits contract is not a payout mechanism - it is an attribution mechanism. Every split update is a ledger of who built what. The community pool is a recognition contract first, and a financial contract second.",
  },
  {
    n: "VI",
    headline: "Capability is not authority.",
    body: "ZOL can draft casts, propose splits, detect cultural moments, and generate receipts. ZOL cannot post, sign, or spend without a human. The AI advisor advises. The human decides. This is not a limitation - it is the only way to build a system that communities can trust.",
  },
  {
    n: "VII",
    headline: "Generative, not extractive. Symbiotic, not parasitic.",
    body: "Sparkz is not designed to extract value from culture. It is designed to let culture generate value for itself. The platform earns from the same pool as the community (1% treasury), so Sparkz' incentive is always aligned with community health. A dying community is a dying platform.",
  },
  {
    n: "VIII",
    headline: "Founder authority decays.",
    body: "Creator control decreases as the community matures. The creator launches, the community grows, and eventually the Hearth belongs more to the community than the creator. This is the goal. A Hearth that a creator controls forever has not achieved what Sparkz is for.",
  },
];

const WHAT_WE_ARE_NOT = [
  "A launchpad - the work is the point, not a launch",
  "A permissionless minting farm - ZAO-curated, self-serve goes through review",
  "An investment platform - a culture-backing tool, not a security",
  "A yield product - fee share, not passive income",
  "An autonomous system - ZOL advises; humans decide",
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
              <span className="text-muted shrink-0" aria-hidden="true">-</span>
              <span className="text-muted">{w}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* The framing */}
      <section>
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          The framing - use this language
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card-solid border border-accent/20 rounded-xl p-4">
            <div className="text-xs font-semibold text-accent mb-3">Say this</div>
            <ul className="space-y-1.5 text-xs">
              {[
                "Light a Hearth, grow it with sparks",
                "Back the album, back the show",
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
                  <span className="text-muted shrink-0" aria-hidden="true">-</span>
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
          The first live Hearth
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          Zoostr (ZABAL × Boostr) was the first live Hearth. 50+ people showed up
          for the culture first. The community pulled, and every Spark since has
          grown it.
        </p>
        <a
          href="https://zoostr.xyz"
          target="_blank"
          rel="noreferrer"
          className="text-accent text-sm hover:underline"
        >
          zoostr.xyz - the live empire ↗
        </a>
      </section>

      {/* CTAs */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/start"
          className="btn-spark px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          Start a Hearth
        </Link>
        <Link
          href="/hearth"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          What is a Hearth?
        </Link>
        <Link
          href="/community-pool"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          Community pool
        </Link>
        <Link
          href="/zao"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          The ZAO
        </Link>
      </section>
    </main>
  );
}

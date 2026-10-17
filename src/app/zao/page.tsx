import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const OG = `${BASE}/api/og?title=${encodeURIComponent("The ZAO")}&subtitle=${encodeURIComponent("Music first · Community second · Technology third")}`;

const DESCRIPTION =
  "Sparkz is part of The ZAO - ZTalent Artist Organization - a decentralized impact network bringing profit margin, data, and IP rights back to artists. Music first.";

export const metadata: Metadata = {
  title: "The ZAO - Sparkz",
  description: DESCRIPTION,
  openGraph: {
    title: "The ZAO - Sparkz",
    description: DESCRIPTION,
    url: `${BASE}/zao`,
    images: [{ url: OG, width: 1200, height: 630, alt: "The ZAO - Sparkz" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The ZAO - Sparkz",
    description: "The creator collective Sparkz is part of. Music first, community second, technology third.",
    images: [OG],
  },
  other: {
    "fc:miniapp": "true",
    "fc:frame": "vNext",
    "fc:frame:image": OG,
    "fc:frame:button:1": "Start a Spark",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${BASE}/start`,
    "fc:frame:button:2": "thezao.xyz",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": "https://www.thezao.xyz",
  },
};

const RETURNS = ["Profit margin", "Data", "IP rights"];

// Sparkz's principles, taken from the README's Principles list.
const PRINCIPLES = [
  {
    title: "No auto-mint",
    body: "Tokenization is an explicit creator choice, later - never a throwaway coin on day one.",
  },
  {
    title: "Monetization tool, not a security",
    body: "Splits are revenue share (utility), not \"shares in the creator.\" No moon talk, no promises.",
  },
  {
    title: "Retention before token",
    body: "Real engagement first - collabs, backing, community - not holder count.",
  },
  {
    title: "Generative, not extractive",
    body: "Symbiotic, not parasitic.",
  },
];

const FACTS = [
  { label: "ZAO stands for", value: "ZTalent Artist Organization" },
  { label: "What it is", value: "A decentralized impact network" },
  { label: "First domain", value: "Music" },
  { label: "Founded by", value: "Zaal (BetterCallZaal)" },
  { label: "Website", value: "thezao.xyz", href: "https://www.thezao.xyz" },
  { label: "The lab", value: "zaoos.com", href: "https://zaoos.com" },
];

export default function ZaoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 space-y-14">
      {/* Header */}
      <section>
        <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wider">
          The collective
        </p>
        <h1 className="text-4xl font-bold mb-4">The ZAO</h1>
        <p className="text-muted text-lg leading-relaxed">
          Sparkz is part of The ZAO, the creator collective behind it. The ZAO is a
          decentralized impact network that brings profit margin, data, and IP rights
          back to artists. Music is its first domain.
        </p>
        <p className="text-muted text-sm mt-3">
          Its priority stack is music first, community second, technology third. Sparkz
          follows the same order: start with a spark and real backing, not a token.
        </p>
      </section>

      {/* Key facts */}
      <section>
        <div className="card-solid border border-border rounded-2xl divide-y divide-border">
          {FACTS.map(({ label, value, href }) => (
            <div
              key={label}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span className="text-muted">{label}</span>
              <span className="font-medium">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {value} ↗
                  </a>
                ) : (
                  value
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* What The ZAO returns to artists */}
      <section>
        <h2 className="text-xl font-bold mb-5">What it returns to artists</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {RETURNS.map((r) => (
            <div key={r} className="card-solid border border-border rounded-xl p-5">
              <div className="font-bold text-sm text-accent">{r}</div>
            </div>
          ))}
        </div>
        <p className="text-muted text-sm mt-4 leading-relaxed">
          Technology is the means, not the headline.
        </p>
      </section>

      {/* Principles */}
      <section>
        <h2 className="text-xl font-bold mb-2">Principles</h2>
        <p className="text-muted text-sm mb-5 leading-relaxed">
          Learned from watching creator coins fail: speculation as the product, forced
          tokenization, zero-utility tokens, extraction dressed as &ldquo;for creators&rdquo;.
        </p>
        <div className="space-y-3">
          {PRINCIPLES.map((g, i) => (
            <div key={g.title} className="card-solid rounded-xl p-4 flex gap-4">
              <div className="text-accent font-black text-sm shrink-0 w-5">
                {i + 1}
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">{g.title}</div>
                <div className="text-muted text-xs leading-relaxed">{g.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/start"
          className="btn-spark px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          Start a Spark
        </Link>
        <a
          href="https://www.thezao.xyz"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          thezao.xyz ↗
        </a>
        <a
          href="https://zaoos.com"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          zaoos.com ↗
        </a>
      </section>
    </main>
  );
}

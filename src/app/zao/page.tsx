import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const OG = `${BASE}/api/og?title=${encodeURIComponent("The ZAO")}&subtitle=${encodeURIComponent("Curation · Culture · Aligned stake")}`;

export const metadata: Metadata = {
  title: "The ZAO — Sparkz",
  description:
    "The ZAO (Zaal Agent Operator) curates Sparkz. 50 vetted sparks per quarter. ZOL is the AI agent. Aligned stake, not a fee slice. Culture before price.",
  openGraph: {
    title: "The ZAO — Sparkz",
    description:
      "ZAO curates the Sparkz ecosystem: vetted sparks, aligned stake, ZOL agent. Not a permissionless farm.",
    url: `${BASE}/zao`,
    images: [{ url: OG, width: 1200, height: 630, alt: "The ZAO — Sparkz" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The ZAO — Sparkz",
    description: "50 vetted sparks/quarter. Aligned stake. ZOL agent. Culture before price.",
    images: [OG],
  },
  other: {
    "fc:miniapp": "true",
    "fc:frame": "vNext",
    "fc:frame:image": OG,
    "fc:frame:button:1": "⬡ Apply for vetting",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://warpcast.com/zaal",
    "fc:frame:button:2": "🔥 Start a Spark",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${BASE}/start`,
  },
};

const ROLES = [
  {
    icon: "⬡",
    title: "Curator",
    body: "ZAO reviews every self-serve Capsule submission. 50 vetted sparks per quarter. Quality over volume — no permissionless minting farm.",
    color: "text-accent",
    border: "border-accent/20",
  },
  {
    icon: "🤝",
    title: "Aligned stakeholder",
    body: "ZAO takes a locked token stake — not a fee slice. The stake aligns ZAO's incentives with the creator's long-term success. ZAO earns when the community earns, not before.",
    color: "text-foreground",
    border: "border-border",
  },
  {
    icon: "🤖",
    title: "ZOL operator",
    body: "ZOL is the ZAO AI agent: Meme Engine drafts, AI advisor, split computation, receipt generation. Always human-gated in v1 — ZOL drafts, humans approve.",
    color: "text-muted",
    border: "border-border",
  },
  {
    icon: "🌐",
    title: "Protocol guardian",
    body: "ZAO maintains the extraction guardrails: culture before price, attribution before extraction, holding is not contribution. These aren't optional — they're the protocol.",
    color: "text-muted",
    border: "border-border",
  },
];

const GUARDRAILS = [
  {
    title: "Culture before price",
    body: "Community identity comes first. Token mechanics serve the culture — not the other way around.",
  },
  {
    title: "Attribution before extraction",
    body: "Every fee flow must credit the contributor. Anonymous extraction is not a Sparkz model.",
  },
  {
    title: "Holding is not contribution",
    body: "Owning earns optionality. Contributing earns fees. Holding a token alone does not entitle anyone to a fee share.",
  },
  {
    title: "Capability is not authority",
    body: "ZOL can draft, compute, and suggest. Humans decide, sign, and post. AI capability does not grant AI authority.",
  },
  {
    title: "Founder-authority decay",
    body: "Creator control decreases as the community matures. ZAO's role is to accelerate that transition, not to capture it.",
  },
];

const FACTS = [
  { label: "Vetting slots", value: "50 per quarter" },
  { label: "ZAO stake model", value: "Locked token stake (not a fee slice)" },
  { label: "Curation standard", value: "Culture-first, self-serve review" },
  { label: "AI agent", value: "ZOL — advisory/creative/guarded tiers (v1)" },
  { label: "Apply via", value: "@zaal on Warpcast" },
  { label: "Website", value: "zaoos.com" },
];

export default function ZaoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 space-y-14">
      {/* Header */}
      <section>
        <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wider">
          The organization
        </p>
        <h1 className="text-4xl font-bold mb-4">The ZAO</h1>
        <p className="text-muted text-lg leading-relaxed">
          ZAO — Zaal Agent Operator — is the curator and aligned stakeholder behind
          Sparkz. Not a protocol fee collector. Not a governance layer. A curator with
          skin in the game.
        </p>
        <p className="text-muted text-sm mt-3">
          Sparkz is ZAO-curated, not permissionless. Every Spark goes through review.
          50 slots per quarter. The scarcity is the signal.
        </p>
      </section>

      {/* Key facts */}
      <section>
        <div className="card-solid border border-border rounded-2xl divide-y divide-border">
          {FACTS.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span className="text-muted">{label}</span>
              <span className="font-medium">
                {label === "Website" ? (
                  <a
                    href="https://zaoos.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {value} ↗
                  </a>
                ) : label === "Apply via" ? (
                  <a
                    href="https://warpcast.com/zaal"
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

      {/* ZAO roles */}
      <section>
        <h2 className="text-xl font-bold mb-5">What ZAO does</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {ROLES.map((r) => (
            <div key={r.title} className={`card-solid border ${r.border} rounded-xl p-5`}>
              <div className="text-2xl mb-2">{r.icon}</div>
              <div className={`font-bold text-sm mb-2 ${r.color}`}>{r.title}</div>
              <div className="text-muted text-xs leading-relaxed">{r.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Extraction guardrails */}
      <section>
        <h2 className="text-xl font-bold mb-2">Extraction guardrails</h2>
        <p className="text-muted text-sm mb-5 leading-relaxed">
          These are the non-negotiable rules ZAO enforces across all Sparkz communities.
          Creators who apply to ZAO vetting commit to these.
        </p>
        <div className="space-y-3">
          {GUARDRAILS.map((g, i) => (
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

      {/* ZOL — the AI agent */}
      <section className="card-solid border border-border rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-3">ZOL — The ZAO AI Agent</h2>
        <p className="text-muted text-sm leading-relaxed mb-4">
          ZOL is the ZAO&rsquo;s AI agent layer. It operates in bounded tiers: advisory
          (recommends splits), creative (drafts Meme Engine content), and guarded (executes
          within approved parameters). Tier 4 (autonomous/mature) is not available in v1.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          {["Advisory — split recommendations", "Creative — Meme Engine drafts", "Guarded — snapshot + receipt generation"].map(
            (t) => (
              <div key={t} className="bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
                {t}
              </div>
            )
          )}
        </div>
        <p className="text-xs text-muted mt-4 leading-relaxed">
          ZOL never posts, signs, or moves funds without explicit human approval.
          The human gate is non-negotiable in v1.
        </p>
      </section>

      {/* CTAs */}
      <section className="flex flex-wrap gap-3">
        <a
          href="https://warpcast.com/zaal"
          target="_blank"
          rel="noreferrer"
          className="btn-spark px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          ⬡ Apply via @zaal
        </a>
        <Link
          href="/vetted"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          Vetting program
        </Link>
        <Link
          href="/start"
          className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:border-border/80 transition-colors"
        >
          🔥 Start a Spark
        </Link>
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

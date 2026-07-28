import Link from "next/link";
import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";

export const dynamic = "force-static";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Farcaster — Sparkz",
  description:
    "FEF: Farcaster Eats First. First announcements, first participation, first backing window go to Farcaster. Sparkz is built native to the Farcaster ecosystem.",
  openGraph: {
    title: "Farcaster — Sparkz",
    description:
      "FEF: first announcements, first participation, first backing window go to Farcaster first.",
    url: `${BASE}/farcaster`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farcaster — Sparkz",
    description: "FEF — Farcaster Eats First. Sparkz is native to the Farcaster ecosystem.",
  },
};

const FEF_POINTS = [
  {
    title: "First announcements",
    body: "When a Spark goes live, when a receipt drops, when a leaderboard milestone hits — Farcaster sees it first. Other channels distribute later.",
  },
  {
    title: "First participation window",
    body: "Early backing, early boosting, early collaboration — all announced on Farcaster before any other channel. Farcaster community has a head start on everything.",
  },
  {
    title: "First backing window",
    body: "New spark launches are shared on Farcaster first, giving the Farcaster community priority access before broader social media.",
  },
  {
    title: "Frame embeds on every page",
    body: "Every Sparkz page has fc:frame metadata for Warpcast embedding. Receipts, leaderboards, backing pages — all shareable as interactive frames directly in Warpcast casts.",
  },
];

const INTEGRATIONS = [
  {
    title: "Sign in with Farcaster",
    icon: "🔐",
    body: "Log in using your Farcaster identity (SIWE). Your Capsule links to your Farcaster handle — no separate account needed.",
    link: "/profile",
    linkLabel: "Sign in →",
  },
  {
    title: "Warpcast miniapp",
    icon: "📱",
    body: "Sparkz runs as a Warpcast miniapp via fc:miniapp protocol. Browse Capsules, back creators, and claim receipts without leaving Warpcast.",
    link: null,
    linkLabel: null,
  },
  {
    title: "Frame embeds",
    icon: "🖼️",
    body: "Every page generates Farcaster frame metadata (fc:frame). Share a receipt or leaderboard as a frame — followers can see key data and tap through without leaving their feed.",
    link: null,
    linkLabel: null,
  },
  {
    title: "ZOL casts to Farcaster",
    icon: "🤖",
    body: "The ZOL Meme Engine publishes to Farcaster first via Neynar. Each cast is grounded in real Capsule data and requires human approval before posting.",
    link: "/meme-engine",
    linkLabel: "Meme Engine →",
  },
];

export default function FarcasterPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      {/* Hero */}
      <section className="pt-14 pb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
          Farcaster native
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          FEF — Farcaster Eats First.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Sparkz is built inside the Farcaster ecosystem, not grafted onto it. First announcements, first participation windows, first backing opportunities — Farcaster gets them first.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-border px-2 py-0.5">✓ SIWE (Sign in with Farcaster)</span>
          <span className="rounded-full border border-border px-2 py-0.5">✓ Warpcast miniapp</span>
          <span className="rounded-full border border-border px-2 py-0.5">✓ fc:frame on every page</span>
        </div>
      </section>

      {/* FEF rules */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          What FEF means in practice
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEF_POINTS.map((p) => (
            <div key={p.title} className="glass p-4">
              <div className="mb-1 font-semibold text-sm">{p.title}</div>
              <p className="text-xs leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          Farcaster integrations
        </h2>
        <div className="space-y-3">
          {INTEGRATIONS.map((i) => (
            <div key={i.title} className="card-solid flex gap-4 p-4">
              <div className="text-2xl shrink-0">{i.icon}</div>
              <div className="flex-1">
                <div className="mb-1 font-semibold text-sm">{i.title}</div>
                <p className="text-xs leading-relaxed text-muted">{i.body}</p>
                {i.link && (
                  <Link href={i.link} className="mt-2 inline-block text-xs text-accent hover:underline">
                    {i.linkLabel}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Farcaster */}
      <section className="border-t border-border py-8">
        <div className="glass p-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">
            Why Farcaster
          </div>
          <h3 className="mb-2 text-base font-semibold">Culture-native distribution</h3>
          <p className="text-sm text-muted leading-relaxed">
            Farcaster has the highest signal-to-noise creator community on any network right now. It's where culture forms before it spreads. Sparkz launches here first because the best early backing comes from people who actually understand the work — not from a broadcast to everyone at once.
          </p>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            FEF is not about locking creators in — it's about starting with the right community. Zoostr proved it: 34+ boosters on Farcaster built the empire before $ZOOSTR even had a price.
          </p>
        </div>
      </section>

      {/* CTAs */}
      <section className="border-t border-border py-8">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/profile" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Sign in with Farcaster</div>
            <div className="text-xs text-muted">Your Farcaster identity across Sparkz</div>
          </Link>
          <Link href="/start" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Light a spark</div>
            <div className="text-xs text-muted">Open your Capsule — FEF from day one</div>
          </Link>
          <Link href="/meme-engine" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Meme Engine</div>
            <div className="text-xs text-muted">ZOL posts to Farcaster (with your approval)</div>
          </Link>
          <Link href="/vetted" className="glass glass-hover p-3">
            <div className="font-medium text-sm">Vetted by ZAO</div>
            <div className="text-xs text-muted">ZAO-backed projects get priority FEF support</div>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-xs text-muted">
        FEF — Farcaster Eats First. Not an exclusivity clause — a launch strategy. Distribute outward after the Farcaster window closes.
      </footer>
    </main>
  );
}

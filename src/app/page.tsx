import Link from "next/link";
import { loadPublicHearths } from "@/lib/public-hearths";
import Ecosystem from "./_components/Ecosystem";
import JoinForm from "./_components/JoinForm";
import ActivityStrip from "./_components/ActivityStrip";
import HeroHearthPreview from "./_components/HeroHearthPreview";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "1",
    h: "Start with a spark",
    p: "Open a Hearth - identity, backing, receipts. No token, no wallet required.",
  },
  {
    n: "2",
    h: "Build momentum",
    p: "Supporters back the work and collect what you make. The Meme Engine amplifies the moments that land.",
  },
  {
    n: "3",
    h: "Graduate, only if it fits",
    p: "If the energy is there, launch a token later on the Clanker rail. Some do, some never. That is fine.",
  },
];

// The anti-SaaS social contract (from docs/strategy/positioning.md) - made visible.
// ZAO voice: plain, receipts over claims, no hype.
const OWNERSHIP = [
  {
    h: "Member-owned, not investor-owned",
    p: "No cap table, no investors. The people who build it own it - earned Respect and the ZAO estate.",
  },
  {
    h: "Contributors earn, not subscribe",
    p: "Sparkz is not a subscription you pay. Contributors earn - aligned upside through ZOLs and the estate, not extraction.",
  },
  {
    h: "Transparent by default",
    p: "Receipts on-chain, revenue in the open. Back the album, not buy a coin.",
  },
];

export default async function Home() {
  const hearths = await loadPublicHearths();

  return (
    <main className="w-full min-w-0 flex-1 overflow-x-hidden">
      {/* Hero - full-bleed background, centered content (no black bars on wide screens) */}
      <section className="relative overflow-hidden">
        <div className="hero-blob hero-blob-v" aria-hidden />
        <div className="hero-blob hero-blob-a" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(120% 80% at 50% -10%, rgba(232,198,106,0.10), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 pt-10 pb-12 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* Left - the pitch */}
          <div>
            <div className="flex items-center gap-3">
              <video
                className="h-14 w-14 rounded-xl sm:h-16 sm:w-16"
                style={{ filter: "drop-shadow(0 8px 28px rgba(232,198,106,0.32))" }}
                autoPlay
                loop
                muted
                playsInline
                poster="/brand/sparkz-logo.png"
                aria-label="Sparkz - gold flame logo"
              >
                <source src="/brand/sparkz-logo.webm" type="video/webm" />
                <source src="/brand/sparkz-logo.mp4" type="video/mp4" />
              </video>
              <span className="eyebrow-pill">Sparkz - for you, the creator</span>
            </div>
            <h1 className="mt-6 text-[clamp(2.1rem,7vw,3.6rem)] font-bold leading-[0.98] tracking-tight">
              Start with a{" "}
              <span className="squig spark-text">
                spark
                <svg viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden>
                  <path
                    d="M2 11 Q 50 2 100 9 T 198 6"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              ,<br />
              not a token.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Open your project&apos;s home -{" "}
              <span className="font-semibold text-foreground">identity, backers, receipts</span>. No
              wallet, no coin to start. The token comes later, if ever.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="sticker sticker-v">no wallet needed</span>
              <span className="sticker sticker-p">back the album</span>
              <span className="sticker sticker-a">Farcaster-native</span>
            </div>
            <div className="mt-8 max-w-md">
              <JoinForm interest="sparkz" />
              <p className="mt-2 text-xs text-muted">
                Light your spark - join the list.{" "}
                <Link href="/explore" className="text-accent hover:underline">
                  or explore the sparks -&gt;
                </Link>
              </p>
            </div>
          </div>

          {/* Right - see the product */}
          <div className="flex justify-center lg:justify-end">
            <HeroHearthPreview />
          </div>
        </div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="spark-text text-xl font-bold">You make the work.</span>
            <span className="text-sm text-muted">
              Sparkz makes it back-able, postable, and provable - before any coin exists.
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <ActivityStrip />
      </div>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-muted">
          How it works
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 text-sm font-semibold text-accent">{s.n}</div>
              <div className="mb-1 font-medium">{s.h}</div>
              <p className="text-sm text-muted">{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
            Not a SaaS - a collective
          </h2>
          <p className="mb-6 max-w-xl text-sm text-muted">
            Sparkz is open-source and member-owned. It earns on what flows through the rails
            it opens, never on renting you a login.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {OWNERSHIP.map((o) => (
              <div key={o.h} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-1 font-medium text-foreground">{o.h}</div>
                <p className="text-sm text-muted">{o.p}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            Part of{" "}
            <a
              href="https://zaoos.com"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              The ZAO
            </a>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
              The ecosystem
            </h2>
            <Link href="/explore" className="text-xs text-accent hover:underline">
              Explore all -&gt;
            </Link>
          </div>
          <Ecosystem hearths={hearths} />
        </div>
      </section>
    </main>
  );
}

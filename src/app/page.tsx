import Link from "next/link";
import { loadPublicCapsules } from "@/lib/public-capsules";
import Ecosystem from "./_components/Ecosystem";
import JoinForm from "./_components/JoinForm";
import Flame from "./_components/Flame";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "1",
    h: "Start with a spark",
    p: "Open a Capsule - identity, backing, receipts. No token, no wallet required.",
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

export default async function Home() {
  const capsules = await loadPublicCapsules();

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 overflow-x-hidden px-4">
      <section className="relative overflow-hidden pt-12 pb-12 sm:pt-16">
        <div className="hero-blob hero-blob-v" aria-hidden />
        <div className="hero-blob hero-blob-a" aria-hidden />
        <div className="relative">
          <span className="eyebrow-pill">Sparkz - for you, the creator</span>
          <div className="mt-6">
            <Flame className="h-20 w-20 flame-live" />
          </div>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.1rem,8.5vw,4rem)] font-bold leading-[0.98] tracking-tight">
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
          <div className="mt-6 flex flex-wrap gap-3">
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
      </section>

      <section className="border-y border-border py-5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="spark-text text-xl font-bold">You make the work.</span>
          <span className="text-sm text-muted">
            Sparkz makes it back-able, postable, and provable - before any coin exists.
          </span>
        </div>
      </section>

      <section className="py-12">
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

      <section className="border-t border-border py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            The ecosystem
          </h2>
          <Link href="/explore" className="text-xs text-accent hover:underline">
            Explore all -&gt;
          </Link>
        </div>
        <Ecosystem capsules={capsules} />
      </section>

      <footer className="border-t border-border py-10 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href="https://github.com/bettercallzaal/sparkz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <Link href="/demo" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/explore" className="hover:text-foreground">
            Explore
          </Link>
          <a href="/architecture" className="hover:text-foreground">
            Architecture
          </a>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link href="/profile" className="hover:text-foreground">
            Sign in with Farcaster
          </Link>
          <span className="opacity-40">Discord - soon</span>
          <Link href="/admin" className="hover:text-foreground">
            Operator
          </Link>
        </div>
        <p className="mt-4 text-xs">
          Sparkz - back the work, build the collective, earn transparently. Part of
          the ZAO ecosystem.
        </p>
      </footer>
    </main>
  );
}

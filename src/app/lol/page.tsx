import Link from "next/link";
import { loadPublicCapsules } from "@/lib/public-capsules";
import Ecosystem from "../_components/Ecosystem";
import JoinForm from "../_components/JoinForm";

export const dynamic = "force-dynamic";

const CHANTS = [
  "back the album, not buy a coin",
  "memes are receipts",
  "culture first, token maybe",
  "your community is the moat",
];

export default async function Lol() {
  const capsules = await loadPublicCapsules();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4">
      {/* Loud culture hero. */}
      <section className="pt-16 pb-10 sm:pt-24">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-accent">
          sparkz.lol
        </p>
        <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
          back the
          <br />
          <span className="bg-gradient-to-r from-accent to-pink-400 bg-clip-text text-transparent">
            album
          </span>
          , not the
          <br />
          coin.
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted">
          Sparkz is where culture gets backed before it gets financialized. No day-one
          coin. No moon talk. Just the work, the crew, and receipts that compound.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {CHANTS.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-8 max-w-md">
          <JoinForm interest="sparkz-lol" />
          <p className="mt-2 text-xs text-muted">
            get in early. bring the memes.
          </p>
        </div>
      </section>

      <section className="border-t border-border py-12">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-muted">
          the roster
        </h2>
        <Ecosystem capsules={capsules} />
      </section>

      <footer className="border-t border-border py-8 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="opacity-40">Discord - soon</span>
          <span className="opacity-40">Farcaster - soon</span>
          <Link href="/" className="hover:text-foreground">
            the serious version -&gt;
          </Link>
        </div>
      </footer>
    </main>
  );
}

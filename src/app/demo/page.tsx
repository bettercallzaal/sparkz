import Link from "next/link";
import Flame from "@/app/_components/Flame";

export const dynamic = "force-static";

export const metadata = {
  title: "How Sparkz works",
  description: "Start with a spark, not a token. The idea in one page.",
};

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full spark-gradient text-xs font-bold text-black">
          {n}
        </span>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}

export default function DemoPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      {/* Hero */}
      <section className="pt-14 pb-8">
        <div className="mb-3 flex items-center gap-2">
          <Flame className="h-7 w-7" />
          <span className="text-xs font-medium uppercase tracking-widest text-accent">
            How Sparkz works
          </span>
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Start with a spark, not a token.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Most creator-coin tools make you launch a coin on day one - which turns your
          community into speculators before you&apos;ve built anything. Sparkz flips
          it: you start with a <span className="spark-text font-semibold">spark</span>,
          build real backing and momentum first, and a token is optional, later, if
          ever. Back the album, not buy a coin.
        </p>
      </section>

      {/* The example */}
      <section className="border-t border-border py-8">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
          The idea, through one example
        </h2>
        <div className="card-solid p-5">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">CoCConcertZ</span> throws live concerts in
            the metaverse. On Sparkz it&apos;s a <span className="spark-text font-semibold">Capsule</span> -
            not a coin. It has an identity, a Farcaster home (
            <span className="font-mono text-accent">/zao</span>), supporters who back
            the work, and a growing trail of receipts. When a show packs the venue,
            the Meme Engine turns that moment into content, publishes it to Farcaster,
            and logs a receipt. No token required - and if the energy&apos;s ever
            there, it can graduate to a treasury or a coin. That&apos;s a spark.
          </p>
          <Link
            href="/c/cocconcertz"
            className="mt-4 inline-block btn-spark rounded-md px-4 py-2 text-sm"
          >
            See the live Capsule
          </Link>
        </div>
      </section>

      {/* The loop */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          The loop
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Step n="1" title="Open a Capsule">
            Identity, backing, receipts, economic config. No coin, no wallet required
            to start.
          </Step>
          <Step n="2" title="People back it">
            Supporters boost and collect. The boost engine amplifies the creator and
            the community that shows up.
          </Step>
          <Step n="3" title="The Meme Engine">
            Flag a cultural moment - Sparkz drafts 3 Capsule-grounded responses (cheap
            AI tier) - you approve one - it publishes.
          </Step>
          <Step n="4" title="Distributed on Farcaster">
            The approved response casts to the Capsule&apos;s Farcaster channel. The
            game is internet traffic; Farcaster eats first.
          </Step>
          <Step n="5" title="Receipts accumulate">
            Every response writes a Meme Receipt - which moment, why it matched, what
            it earned. That data is the moat.
          </Step>
          <Step n="6" title="Graduate, only if it fits">
            If the momentum&apos;s real: a tokenless empire (create2 treasury) or a
            token on the Clanker rail. Some do, some never. Fine either way.
          </Step>
        </div>
      </section>

      {/* The moat */}
      <section className="border-t border-border py-8">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
          Why it&apos;s different
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          The moat isn&apos;t the token contract, and it isn&apos;t image generation.
          It&apos;s the accumulating system - Capsules + backing + cultural memory +
          meme lineage + receipts + attribution. The more Sparkz runs, the smarter
          every Capsule gets. A price pump with a dead community isn&apos;t healthy; a
          small project with growing contributors and repeat backers is - even
          pre-token.
        </p>
      </section>

      {/* See it live */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          See it live
        </h2>
        <Link
          href="/explore"
          className="mb-2 flex items-center justify-between spark-gradient rounded-lg p-4 text-black"
        >
          <div>
            <div className="font-semibold">Explore every ZAO Spark</div>
            <div className="text-xs opacity-80">
              Filter the whole ecosystem by type, status, backing, integrations
            </div>
          </div>
          <span className="text-lg">-&gt;</span>
        </Link>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/c/testing-spark" className="glass glass-hover p-3">
            <div className="font-medium">A Spark, end to end</div>
            <div className="text-xs text-muted">/c/testing-spark - boost, receipts, integrations</div>
          </Link>
          <Link href="/explore" className="glass glass-hover p-3">
            <div className="font-medium">The directory</div>
            <div className="text-xs text-muted">every Spark + its parameters, filterable</div>
          </Link>
          <Link href="/admin/empire" className="glass glass-hover p-3">
            <div className="font-medium">Launch a tokenless empire</div>
            <div className="text-xs text-muted">create2 treasury on Base</div>
          </Link>
          <Link href="/profile" className="glass glass-hover p-3">
            <div className="font-medium">Sign in with Farcaster</div>
            <div className="text-xs text-muted">your identity across Sparkz</div>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-xs text-muted">
        Sparkz - back the work, build the collective, earn transparently. Part of the
        ZAO ecosystem.
      </footer>
    </main>
  );
}

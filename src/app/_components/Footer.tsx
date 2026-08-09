import Link from "next/link";
import Flame from "./Flame";

// Global footer - on every page via the root layout, so no page is a dead end.
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Flame className="h-5 w-5" />
            Sparkz
          </Link>
          <Link href="/explore" className="hover:text-foreground">
            Explore
          </Link>
          <Link href="/start" className="hover:text-foreground">
            Light a spark
          </Link>
          <Link href="/demo" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <a href="/architecture" className="hover:text-foreground">
            Architecture
          </a>
          <Link href="/profile" className="hover:text-foreground">
            Sign in with Farcaster
          </Link>
          <a
            href="https://github.com/bettercallzaal/sparkz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <span className="opacity-40">Discord - soon</span>
          <Link href="/admin" className="ml-auto opacity-60 hover:opacity-100">
            Operator
          </Link>
        </div>
        <nav className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-8 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
              Learn
            </span>
            <Link href="/manifesto" className="hover:text-foreground">Manifesto</Link>
            <Link href="/hearth" className="hover:text-foreground">The Hearth</Link>
            <Link href="/meme-engine" className="hover:text-foreground">Meme Engine</Link>
            <Link href="/graduation" className="hover:text-foreground">Graduation</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
              Participate
            </span>
            <Link href="/examples" className="hover:text-foreground">Spark templates</Link>
            <Link href="/contribution" className="hover:text-foreground">Contribution</Link>
            <Link href="/split-wizard" className="hover:text-foreground">Split wizard</Link>
            <Link href="/community-pool" className="hover:text-foreground">Community pool</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
              Ecosystem
            </span>
            <Link href="/zao" className="hover:text-foreground">The ZAO</Link>
            <Link href="/farcaster" className="hover:text-foreground">Farcaster</Link>
            <Link href="/audius" className="hover:text-foreground">Audius</Link>
          </div>
        </nav>
        <p className="mt-8 text-xs">
          Sparkz - start with a spark, not a token. Back the work, build the collective,
          earn transparently. Part of{" "}
          <a
            href="https://zaoos.com"
            target="_blank"
            rel="noreferrer"
            className="text-accent-3 hover:underline"
          >
            The ZAO
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

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
        <p className="mt-4 text-xs">
          Sparkz - start with a spark, not a token. Back the work, build the collective,
          earn transparently. Part of the ZAO ecosystem.
        </p>
      </div>
    </footer>
  );
}

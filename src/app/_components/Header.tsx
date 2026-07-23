import Link from "next/link";
import Flame from "./Flame";
import HeaderAuth from "./HeaderAuth";

// Global sticky header - every page gets it via the root layout. Flame home,
// a few key destinations, and a persistent "Try Sparkz" CTA so a first-time
// visitor always has a way forward.
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Flame className="h-6 w-6" />
          <span className="text-[15px]">Sparkz</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-5 text-sm text-muted sm:flex">
          <Link href="/explore" className="hover:text-foreground">
            Explore
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
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/explore" className="text-sm text-muted hover:text-foreground sm:hidden">
            Explore
          </Link>
          <HeaderAuth />
          <Link href="/start" className="btn-spark rounded-lg px-4 py-1.5 text-sm">
            Try Sparkz
          </Link>
        </div>
      </div>
    </header>
  );
}

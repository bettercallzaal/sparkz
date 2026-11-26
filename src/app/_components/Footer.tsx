import Link from "next/link";
import Flame from "./Flame";

// Global footer - on every page via the root layout, so no page is a dead end. Kept to one
// row (design pass, Zaal 14 Nov 2026).
export default function Footer() {
  return (
    <footer className="web-only mt-auto border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Flame className="h-5 w-5" />
            Sparkz
          </Link>
          <Link href="/explore" className="hover:text-foreground">
            Explore
          </Link>
          <Link href="/manifesto" className="hover:text-foreground">
            Manifesto
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link href="/access" className="hover:text-foreground">
            What you can do
          </Link>
          <a
            href="https://github.com/bettercallzaal/sparkz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <Link href="/profile" className="hover:text-foreground">
            Account
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
        <p className="mt-6 text-xs">
          Back the album, not a coin. Part of{" "}
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
        <p className="mt-2 text-xs">
          Wallet connection: Portions © 2025 Reown, Inc. All Rights Reserved.{" "}
          <a
            href="https://github.com/bettercallzaal/sparkz/blob/main/NOTICE"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Notices
          </a>
        </p>
      </div>
    </footer>
  );
}

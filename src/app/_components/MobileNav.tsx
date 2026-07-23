"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/start", label: "Light a spark" },
  { href: "/demo", label: "How it works" },
  { href: "/blog", label: "Blog" },
  { href: "/architecture", label: "Architecture" },
  { href: "/profile", label: "Sign in with Farcaster" },
];

// Mobile nav disclosure (shown < sm; the full nav shows inline on larger screens).
export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6l-12 12" />
            </>
          ) : (
            <>
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-14 z-40 bg-black/40"
          />
          <nav className="absolute inset-x-0 top-14 z-50 border-b border-border bg-background/95 backdrop-blur-md">
            <ul className="mx-auto flex max-w-5xl flex-col px-4 py-2">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-border/60 py-3 text-sm text-muted hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

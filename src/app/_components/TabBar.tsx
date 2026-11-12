"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Bottom tab bar for the iPhone app: Home, Explore, a center create button, Me.
// Rendered on every page but only visible under html[data-shell="ios"] (see
// NativeShell.tsx and the .tab-bar rules in globals.css), so the website is unchanged.
// Follows Apple's tab bar guidance (prefer a tab bar for navigation, single-word
// labels, never hide tabs) with a raised center "+" as the one action slot.
type Tab = { href: string; label: string; icon: React.ReactNode; match: (p: string) => boolean };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    match: (p) => p === "/",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    href: "/explore",
    label: "Explore",
    match: (p) => p.startsWith("/explore") || p.startsWith("/c/"),
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    href: "/start",
    label: "New",
    match: (p) => p.startsWith("/start"),
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" {...stroke}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Me",
    match: (p) => p.startsWith("/profile"),
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname() || "/";
  return (
    <nav aria-label="App tabs" className="tab-bar">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map((t) => {
          const active = t.match(pathname);
          const isNew = t.href === "/start";
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] active:opacity-70 ${
                  active ? "text-foreground" : "text-muted"
                }`}
              >
                {isNew ? (
                  <span className="btn-spark flex h-9 w-12 items-center justify-center rounded-xl">
                    {t.icon}
                  </span>
                ) : (
                  t.icon
                )}
                <span className={isNew ? "sr-only" : ""}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

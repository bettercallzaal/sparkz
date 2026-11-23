"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Bottom tab bar for the iPhone app: two tabs, Home and Me (redesign decision Q1, option
// a). Explore and Hearth pages sit under Home, so Home stays selected there. Rendered on
// every page but only visible under html[data-shell="ios"] (see NativeShell.tsx and the
// .tab-bar rules in globals.css), so the website is unchanged. Follows Apple's tab bar
// guidance: prefer a tab bar for navigation, single-word labels, never hide tabs.
type Tab = { href: string; label: string; icon: React.ReactNode; match: (p: string) => boolean };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const isMe = (p: string) => p.startsWith("/profile");

const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    match: (p) => !isMe(p),
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Me",
    match: isMe,
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
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] active:opacity-70 ${
                  active ? "text-foreground" : "text-muted"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_TABS, tabFor, type AppTab } from "@/lib/app-tabs";

// Bottom tab bar for the iPhone app: Home, My Hearths, My Sparkz, Me (lib/app-tabs.ts,
// the same list the native bar in NativeChrome.tsx draws, so the two stay in step).
// Explore and Hearth pages sit under Home, so Home stays selected there. Rendered on
// every page but only visible under html[data-shell="ios"] (see NativeShell.tsx and the
// .tab-bar rules in globals.css), so the website is unchanged. Follows Apple's tab bar
// guidance: prefer a tab bar for navigation, short labels, never hide tabs.

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONS: Record<AppTab["id"], React.ReactNode> = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  hearths: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5Z" />
    </svg>
  ),
  sparkz: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6 6 2 2M16 16l2 2M6 18l2-2M16 8l2-2" />
    </svg>
  ),
  me: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  ),
};

export default function TabBar() {
  const pathname = usePathname() || "/";
  const current = tabFor(pathname).id;
  return (
    <nav aria-label="App tabs" className="tab-bar">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {APP_TABS.map((t) => {
          const active = t.id === current;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] active:opacity-70 ${
                  active ? "text-foreground" : "text-muted"
                }`}
              >
                {ICONS[t.id]}
                <span className="whitespace-nowrap">{t.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

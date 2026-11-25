// The iPhone app's bottom bar, one list for both bars: the native UITabBar
// (NativeChrome.tsx) and the HTML fallback (TabBar.tsx) read it, so they cannot drift.
//
// Zaal, 25 Nov 2026: "one should be my hearths, and other should be my sparkz at the
// bottom". Four tabs: Home, My Hearths, My Sparkz, Me. Explore is not a tab; it is
// reached from Home, and Explore and Hearth pages (/c/...) keep Home selected.
//
// Word note: here a Spark is a thing on a Hearth (a bounty, a token, a boost, an event),
// Zaal's meaning. Older code sometimes calls a whole Hearth a "spark" (hearths.status
// 'spark', YourSparks.tsx, /api/capsules/create-spark); that is not what My Sparkz lists.

export type AppTab = {
  id: "home" | "hearths" | "sparkz" | "me";
  title: string;
  href: string;
  /** SF Symbol names for the native bar. */
  symbol: string;
  selected: string;
};

export const APP_TABS: readonly AppTab[] = [
  { id: "home", title: "Home", href: "/", symbol: "house", selected: "house.fill" },
  { id: "hearths", title: "My Hearths", href: "/my-hearths", symbol: "flame", selected: "flame.fill" },
  { id: "sparkz", title: "My Sparkz", href: "/my-sparkz", symbol: "sparkles", selected: "sparkles" },
  { id: "me", title: "Me", href: "/profile", symbol: "person.crop.circle", selected: "person.crop.circle.fill" },
];

function under(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The tab that is selected for a route. Anything not owned by another tab is Home. */
export function tabFor(pathname: string): AppTab {
  return APP_TABS.find((t) => t.href !== "/" && under(pathname, t.href)) ?? APP_TABS[0];
}

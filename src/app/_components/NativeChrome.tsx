"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

// Native iOS chrome for the iPhone app: a real UITabBar drawn by the system
// (@capgo/capacitor-native-navigation) instead of the HTML tab bar, plus native
// pull-to-refresh on Home and Explore. Nothing here runs on the website: the plugin
// is loaded only when Capacitor reports a native platform, and the HTML TabBar stays
// as the fallback until the native bar is up (html[data-native-chrome] hides it).
//
// Insets: the plugin writes --cap-native-navigation-bottom on <html>; shell.css uses
// it for the body padding so content never sits under the bar.
//
// Not done here on purpose: a native navbar. The web Header carries sign-in, the
// avatar and the menu, so a native title bar on top of it would be two headers.
// Decide that after seeing this build on a phone.

type Tab = { id: string; title: string; href: string; symbol: string; selected: string };

const TABS: Tab[] = [
  { id: "home", title: "Home", href: "/", symbol: "house", selected: "house.fill" },
  { id: "explore", title: "Explore", href: "/explore", symbol: "magnifyingglass", selected: "sparkle.magnifyingglass" },
  { id: "new", title: "New", href: "/start", symbol: "plus.circle", selected: "plus.circle.fill" },
  { id: "me", title: "Me", href: "/profile", symbol: "person.crop.circle", selected: "person.crop.circle.fill" },
];

function tabFor(pathname: string): Tab {
  if (pathname.startsWith("/explore") || pathname.startsWith("/c/")) return TABS[1];
  if (pathname.startsWith("/start")) return TABS[2];
  if (pathname.startsWith("/profile")) return TABS[3];
  return TABS[0];
}

function cssColor(name: string, fallback: string): string {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v.startsWith("#") ? v : fallback;
  } catch {
    return fallback;
  }
}

export default function NativeChrome() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const ready = useRef(false);
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  // Mount once: configure, draw the tab bar, wire the listeners.
  useEffect(() => {
    let native = false;
    try {
      native = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
    } catch {
      native = false;
    }
    if (!native) return;

    let cancelled = false;
    const handles: { remove: () => Promise<void> }[] = [];

    (async () => {
      const { NativeNavigation } = await import("@capgo/capacitor-native-navigation");
      if (cancelled) return;

      const colors = {
        tint: cssColor("--accent", "#e8c66a"),
        inactiveTint: cssColor("--muted", "#a29a88"),
        background: cssColor("--background", "#0a0908"),
      };

      await NativeNavigation.configure({ enabled: true, contentInsetMode: "css", colors });
      await NativeNavigation.setTabbar({
        tabs: TABS.map((t) => ({
          id: t.id,
          title: t.title,
          icon: { ios: { sfSymbol: t.symbol } },
          selectedIcon: { ios: { sfSymbol: t.selected } },
        })),
        selectedId: tabFor(pathRef.current).id,
        colors,
      });
      document.documentElement.dataset.nativeChrome = "1";
      ready.current = true;

      handles.push(
        await NativeNavigation.addListener("tabSelect", (e) => {
          const t = TABS.find((x) => x.id === e.id);
          if (!t) return;
          if (pathRef.current === t.href) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          router.push(t.href);
        }),
      );

      handles.push(
        await NativeNavigation.addListener("pullToRefresh", () => {
          // /explore fetches on the client, so only a reload brings fresh rows.
          if (pathRef.current.startsWith("/explore")) {
            window.location.reload();
            return;
          }
          router.refresh();
          window.setTimeout(() => {
            NativeNavigation.endPullToRefresh().catch(() => {});
          }, 700);
        }),
      );
    })().catch(() => {
      // Plugin missing in this build (older TestFlight): the HTML tab bar stays.
    });

    return () => {
      cancelled = true;
      for (const h of handles) h.remove().catch(() => {});
    };
    // router is stable; pathname is read through pathRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the selected tab and pull-to-refresh in step with the route.
  useEffect(() => {
    if (!ready.current) return;
    (async () => {
      const { NativeNavigation } = await import("@capgo/capacitor-native-navigation");
      await NativeNavigation.setTabbar({
        tabs: TABS.map((t) => ({
          id: t.id,
          title: t.title,
          icon: { ios: { sfSymbol: t.symbol } },
          selectedIcon: { ios: { sfSymbol: t.selected } },
        })),
        selectedId: tabFor(pathname).id,
      });
      const refreshable = pathname === "/" || pathname.startsWith("/explore");
      await NativeNavigation.setPullToRefresh({ enabled: refreshable });
    })().catch(() => {});
  }, [pathname]);

  return null;
}

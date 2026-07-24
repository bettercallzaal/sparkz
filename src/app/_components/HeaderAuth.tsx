"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "@farcaster/auth-kit";
import { appUrl } from "@/lib/origins";

// Compact header auth chip. When signed out, a link to /profile (where the full
// Sign-In-With-Farcaster button lives). When signed in, the user's pfp -> /profile.
//
// Sign-in only works on the app domain (sparkz.lol), where the SIWF domain matches. On
// the marketing domain (trysparkz.com) the chip is a plain link into the app to sign in.
export default function HeaderAuth() {
  const { isAuthenticated, profile } = useProfile();
  const [onApp, setOnApp] = useState(true); // assume app during SSR/first paint

  useEffect(() => {
    const h = window.location.hostname;
    // Reading the host on mount is a genuine sync-from-external case (the host is only
    // known client-side); it must run after mount to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOnApp(h.endsWith("sparkz.lol") || h === "localhost" || h.startsWith("127."));
  }, []);

  if (!onApp) {
    return (
      <a
        href={appUrl("/profile")}
        className="hidden text-sm text-muted hover:text-foreground sm:inline"
      >
        Sign in
      </a>
    );
  }

  if (isAuthenticated && profile?.username) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-1.5 rounded-full border border-border py-0.5 pl-0.5 pr-2.5 text-sm hover:border-accent/60"
      >
        {profile.pfpUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.pfpUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <span className="h-6 w-6 rounded-full bg-accent/30" />
        )}
        <span className="hidden max-w-24 truncate text-muted sm:inline">@{profile.username}</span>
      </Link>
    );
  }

  return (
    <Link href="/profile" className="hidden text-sm text-muted hover:text-foreground sm:inline">
      Sign in
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useProfile } from "@farcaster/auth-kit";

// Compact header auth chip. When signed out, a link to /profile (where the full
// Sign-In-With-Farcaster button lives). When signed in, the user's pfp -> /profile.
export default function HeaderAuth() {
  const { isAuthenticated, profile } = useProfile();

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

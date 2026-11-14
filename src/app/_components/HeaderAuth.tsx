"use client";

import Link from "next/link";
import { useViewerProfile } from "@/lib/view-as";

// Compact header auth chip. When signed out, a link to /profile (where the full
// Sign-In-With-Farcaster button lives). When signed in, the user's pfp -> /profile.
// Signed in on the server session alone (app reopened, auth-kit empty) there is no
// username or picture yet, so the chip shows a plain avatar and "Me".
export default function HeaderAuth() {
  const { isAuthenticated, profile } = useViewerProfile();

  if (isAuthenticated && (profile?.username || profile?.fid)) {
    return (
      <Link
        href="/profile"
        className="flex min-h-11 items-center gap-1.5 rounded-full border border-border py-0.5 pl-0.5 pr-2.5 text-sm hover:border-accent/60 active:border-accent sm:min-h-0"
      >
        {profile.pfpUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.pfpUrl} alt="" className="h-9 w-9 rounded-full object-cover sm:h-6 sm:w-6" />
        ) : (
          <span className="h-9 w-9 rounded-full bg-accent/30 sm:h-6 sm:w-6" />
        )}
        <span className="hidden max-w-24 truncate text-muted sm:inline">
          {profile.username ? `@${profile.username}` : "Me"}
        </span>
      </Link>
    );
  }

  return (
    <Link href="/profile" className="inline-flex min-h-11 items-center px-2 text-sm text-muted hover:text-foreground active:text-foreground sm:min-h-0 sm:px-0">
      Sign in
    </Link>
  );
}

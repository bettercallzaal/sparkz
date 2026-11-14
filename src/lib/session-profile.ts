// Who the UI treats as signed in. Pure, so it is unit-tested (session-profile.test.ts).
//
// Bug (Zaal, TestFlight, 14 Nov 2026: "Even signed in I dont see a home"): Home, the header,
// Boost and the Hearth actions read auth-kit's client state (useProfile), which only exists
// right after a Farcaster sign-in in the same page load. Reopen the app and auth-kit starts
// empty while the 7-day sparkz_session cookie is still valid, so the Me page (which asks
// /api/auth/me) said "Signed in" and Home said "Sign in". The server session is the truth:
// when auth-kit has nothing, fall back to the FID /api/auth/me returned.

export interface ProfileShape {
  isAuthenticated: boolean;
  profile: { fid?: number; username?: string; displayName?: string; pfpUrl?: string } & Record<string, unknown>;
}

export interface ViewerShape {
  /** "guest" when an admin is viewing Sparkz as a signed-out visitor. */
  viewAs: string;
  /** The server session's FID from /api/auth/me, or null. */
  fid: number | null;
}

export function mergeSessionProfile<T extends ProfileShape>(real: T, viewer: ViewerShape): T {
  // An admin viewing as Guest sees the signed-out shape, whatever the session says.
  if (viewer.viewAs === "guest") return { ...real, isAuthenticated: false, profile: {} };
  // A fresh Farcaster sign-in in this page: auth-kit has the full profile (name, picture).
  if (real.isAuthenticated) return real;
  // Reopened app or page: auth-kit is empty but the server session is valid.
  if (viewer.fid !== null) return { ...real, isAuthenticated: true, profile: { fid: viewer.fid } };
  return real;
}

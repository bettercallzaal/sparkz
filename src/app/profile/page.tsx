"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton } from "@farcaster/auth-kit";
import { useViewer, useViewerProfile } from "@/lib/view-as";
import { ViewAsSwitcher } from "@/app/_components/ViewAs";
import { SetupZaoButton } from "@/app/_components/AdminSetup";
import Flame from "@/app/_components/Flame";
import YourSparks from "@/app/_components/YourSparks";
import HypersnapSigner from "@/app/_components/HypersnapSigner";
import DeleteAccount from "@/app/_components/DeleteAccount";
import {
  currentFid,
  exchangeSiwf,
  fetchNonce,
  inMiniApp,
  miniAppSignIn,
  signOut,
} from "@/lib/auth-session-client";

export default function ProfilePage() {
  const {
    isAuthenticated,
    profile: { fid, username, displayName, bio, pfpUrl, custody, verifications },
  } = useViewerProfile();

  // The verified server session (lib/session.ts). auth-kit's state above is
  // browser-only; owner actions on the server need this.
  const [realServerFid, setServerFid] = useState<number | null>(null);
  // Admin is decided by the server from the verified session (lib/auth.ts
  // isAdminSession, allowlist in lib/admin-identities.ts), read through useViewer.
  // It only decides what to show; every admin route checks again on the server.
  // View-as (lib/view-as.ts) can hide it and the session from the UI, never grant.
  const viewer = useViewer();
  const admin = viewer.admin;
  const serverFid = viewer.viewAs === "guest" ? null : realServerFid;
  const [miniApp, setMiniApp] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    currentFid().then(setServerFid).catch(() => setServerFid(null));
    inMiniApp().then(setMiniApp);
  }, []);

  // Zaal, 19 Nov 2026 (screenshot): reopened, this page showed "fid 19640" twice and no
  // picture. Only a fresh Farcaster sign-in fills auth-kit's profile; a reopened session
  // knows the FID alone. The header already fetches the public profile for that case
  // (HeaderAuth); this page now does the same.
  const lookupFid = fid ?? serverFid ?? null;
  const [looked, setLooked] = useState<PublicProfile | null>(null);
  useEffect(() => {
    if (!lookupFid || (displayName && pfpUrl)) return;
    let alive = true;
    fetch(`/api/hypersnap/profile?fid=${lookupFid}`)
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.ok && j.data) setLooked(j.data as PublicProfile);
      })
      .catch(() => {
        // The FID still shows; a missing name is not worth an error banner.
      });
    return () => {
      alive = false;
    };
  }, [lookupFid, displayName, pfpUrl]);
  const shownName = displayName ?? looked?.display ?? username ?? looked?.username ?? null;
  const shownUsername = username ?? looked?.username ?? null;
  const shownPfp = pfpUrl ?? looked?.pfp ?? null;
  const shownBio = bio ?? looked?.bio ?? null;

  async function onMiniAppSignIn() {
    setSignInError(null);
    try {
      const verified = await miniAppSignIn();
      if (verified) setServerFid(verified);
      else setSignInError("Sign-in could not be verified. Try again.");
    } catch {
      setSignInError("Sign-in was cancelled.");
    }
  }

  // Signed in through the mini-app door: no auth-kit profile, but a verified FID.
  const miniAppSession = !isAuthenticated && serverFid !== null;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          &larr; Sparkz
        </Link>

      </div>

      <header className="mb-8 flex items-center gap-3">
        <Flame className="h-8 w-8" />
        <div>
          {/* Design brief G1: this page is "Me" in the tab bar, so it says Me once you
              are signed in, and plainly asks you to sign in when you are not. */}
          <h1 className="text-2xl font-semibold tracking-tight">
            {isAuthenticated || serverFid !== null ? "Me" : "Sign in"}
          </h1>
          <p className="text-sm text-muted">
            {isAuthenticated || serverFid !== null
              ? "Your Hearths and your Farcaster identity."
              : "Sign in with Farcaster - your identity across Sparkz."}
          </p>
        </div>
      </header>

      {miniAppSession ? (
        <section className="glass p-5">
          <ProfileHeader
            name={shownName}
            username={shownUsername}
            pfp={shownPfp}
            fid={serverFid}
          />
          {shownBio && <p className="mt-4 text-sm text-muted">{shownBio}</p>}
          <YourSparks fid={serverFid} />
          <Link
            href="/start"
            className="btn-spark mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm"
          >
            New Hearth
          </Link>
          <SignOutLink onDone={() => setServerFid(null)} />
          <DeleteAccount />
        </section>
      ) : !isAuthenticated ? (
        <section className="glass p-5">
          <p className="mb-4 text-sm text-muted">
            Connect your Farcaster account. Free, protocol-native - no wallet gas,
            no email. This is the identity your Hearths and casts hang off of.
          </p>
          {miniApp ? (
            <button
              type="button"
              onClick={onMiniAppSignIn}
              className="btn-spark rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              Sign in with Farcaster
            </button>
          ) : (
            <SignInButton
              nonce={fetchNonce}
              onSuccess={async (res) => {
                setSignInError(null);
                if (!res.message || !res.signature) return;
                const verified = await exchangeSiwf(res.message, res.signature);
                setServerFid(verified);
                if (!verified) setSignInError("Sign-in could not be verified. Try again.");
              }}
            />
          )}
          {signInError && <p className="mt-3 text-sm text-red-400">{signInError}</p>}
        </section>
      ) : (
        <section className="glass p-5">
          <ProfileHeader
            name={shownName}
            username={shownUsername}
            pfp={shownPfp}
            fid={fid ?? null}
          />

          {shownBio && <p className="mt-4 text-sm text-muted">{shownBio}</p>}

          {fid ? <HypersnapSigner fid={fid} custody={custody ?? null} /> : null}

          <div className="mt-4 space-y-1 text-xs text-muted">
            {custody && (
              <p>
                custody{" "}
                <span className="font-mono text-foreground">
                  {custody.slice(0, 6)}...{custody.slice(-4)}
                </span>
              </p>
            )}
            {verifications && verifications.length > 0 && (
              <p>
                verified{" "}
                <span className="font-mono text-foreground">
                  {verifications[0].slice(0, 6)}...{verifications[0].slice(-4)}
                </span>
                {verifications.length > 1 ? ` +${verifications.length - 1}` : ""}
              </p>
            )}
          </div>

          {fid && <YourSparks fid={fid} />}
          {fid && (
            <Link
              href="/start"
              className="btn-spark mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm"
            >
              New Hearth
            </Link>
          )}
          {serverFid === null && (
            <p className="mt-4 text-xs text-muted">
              {signInError ?? "Verifying your sign-in with the server..."}
            </p>
          )}
          <SignOutLink onDone={() => setServerFid(null)} />
          <DeleteAccount />
        </section>
      )}

      <ViewAsSwitcher />

      {admin && (
        <section className="glass mt-6 p-2">
          <h2 className="px-3 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-accent">
            Admin
          </h2>
          <ul>
            {ADMIN_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm active:bg-white/10"
                >
                  {l.label}
                  <span aria-hidden className="text-muted">&rsaquo;</span>
                </Link>
              </li>
            ))}
          </ul>
          {/* One-time seeding, safe to run twice. Kept out of the main list so it does
              not read as the page's main action. */}
          <details className="mt-1 rounded-md px-3 pb-2 text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center text-muted">
              One-time setup
            </summary>
            <div className="-mx-3">
              <SetupZaoButton />
            </div>
          </details>
        </section>
      )}

      {/* About Sparkz: in the iPhone app the header menu and footer are hidden, so the
          marketing pages live here under Me as one list (design brief A2; App Store
          guideline 4.2.2: an app should not be mainly marketing pages and links).
          On the website the header and footer already carry these, so it stays hidden. */}
      <section className="glass mt-6 hidden p-2 [html[data-shell=ios]_&]:block">
        <h2 className="px-3 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted">
          About Sparkz
        </h2>
        <ul>
          {ABOUT.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm active:bg-white/10"
              >
                {l.label}
                <span aria-hidden className="text-muted">&rsaquo;</span>
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://github.com/bettercallzaal/sparkz/blob/main/NOTICE"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm active:bg-white/10"
            >
              Open-source notices
              <span aria-hidden className="text-muted">&rsaquo;</span>
            </a>
          </li>
        </ul>
        {/* Required by the Reown and WalletConnect Community Licenses (see NOTICE). The
            web footer carries the same line; the footer is hidden in the iPhone app. */}
        <p className="px-3 pt-1 pb-2 text-xs text-muted">
          Wallet connection: Portions © 2025 Reown, Inc. All Rights Reserved.
        </p>
      </section>
    </main>
  );
}

// Shown only to an admin session. The pages call admin-only API routes, which run
// requireAdmin on the server.
const ADMIN_LINKS = [
  { href: "/admin", label: "Admin dashboard" },
  { href: "/admin/pending", label: "Pending approvals" },
  { href: "/admin/team", label: "Team applications" },
  { href: "/admin/new", label: "New Hearth (operator)" },
  { href: "/admin/add-repo", label: "Add a repo Hearth" },
  { href: "/admin/empire", label: "Empire tools" },
];

const ABOUT = [
  { href: "/demo", label: "How it works" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/blog", label: "Blog" },
  { href: "/architecture", label: "Architecture" },
];

type PublicProfile = {
  username?: string;
  display?: string;
  pfp?: string;
  bio?: string;
};

// Name, @handle and picture, with the FID as the small line. Falls back to "fid N" as
// the name only when the public profile could not be read.
function ProfileHeader({
  name,
  username,
  pfp,
  fid,
}: {
  name: string | null;
  username: string | null;
  pfp: string | null;
  fid: number | null;
}) {
  return (
    <div className="flex items-center gap-4">
      {pfp && (
        <div
          className="h-16 w-16 shrink-0 rounded-full bg-cover bg-center ring-2 ring-accent"
          style={{ backgroundImage: `url(${pfp})` }}
        />
      )}
      <div className="min-w-0">
        <div className="text-lg font-semibold">{name ?? (fid ? `fid ${fid}` : "Signed in")}</div>
        {username && <div className="text-sm text-accent">@{username}</div>}
        {name && fid ? <div className="text-xs text-muted">fid {fid}</div> : null}
      </div>
    </div>
  );
}

// Ends the server session. auth-kit keeps its own browser state, so reload to
// clear both.
function SignOutLink({ onDone }: { onDone: () => void }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        onDone();
        window.location.reload();
      }}
      className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border px-4 text-sm text-muted hover:text-foreground active:bg-white/10"
    >
      Sign out
    </button>
  );
}

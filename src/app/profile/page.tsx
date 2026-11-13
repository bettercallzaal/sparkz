"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton, useProfile } from "@farcaster/auth-kit";
import Flame from "@/app/_components/Flame";
import YourSparks from "@/app/_components/YourSparks";
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
  } = useProfile();

  // The verified server session (lib/session.ts). auth-kit's state above is
  // browser-only; owner actions on the server need this.
  const [serverFid, setServerFid] = useState<number | null>(null);
  const [miniApp, setMiniApp] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    currentFid().then(setServerFid).catch(() => setServerFid(null));
    inMiniApp().then(setMiniApp);
  }, []);

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
        <span className="text-sm font-medium">Your identity</span>
      </div>

      <header className="mb-8 flex items-center gap-3">
        <Flame className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ZAO profile</h1>
          <p className="text-sm text-muted">
            Sign in with Farcaster - your identity across Sparkz.
          </p>
        </div>
      </header>

      {miniAppSession ? (
        <section className="glass p-5">
          <div className="text-lg font-semibold">Signed in</div>
          <div className="text-xs text-muted">fid {serverFid}</div>
          <YourSparks fid={serverFid} />
          <Link
            href="/start"
            className="btn-spark mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm"
          >
            New Hearth
          </Link>
          <SignOutLink onDone={() => setServerFid(null)} />
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
          <div className="flex items-center gap-4">
            {pfpUrl && (
              <div
                className="h-16 w-16 shrink-0 rounded-full bg-cover bg-center ring-2 ring-accent"
                style={{ backgroundImage: `url(${pfpUrl})` }}
              />
            )}
            <div className="min-w-0">
              <div className="text-lg font-semibold">
                {displayName ?? username ?? `fid ${fid}`}
              </div>
              {username && <div className="text-sm text-accent">@{username}</div>}
              <div className="text-xs text-muted">fid {fid}</div>
            </div>
          </div>

          {bio && <p className="mt-4 text-sm text-muted">{bio}</p>}

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

const ABOUT = [
  { href: "/demo", label: "How it works" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/blog", label: "Blog" },
  { href: "/architecture", label: "Architecture" },
];

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
      className="mt-6 inline-flex min-h-11 items-center text-sm text-muted underline hover:text-foreground active:text-foreground sm:min-h-0 sm:text-xs"
    >
      Sign out
    </button>
  );
}

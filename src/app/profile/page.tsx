"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton, useProfile } from "@farcaster/auth-kit";
import Flame from "@/app/_components/Flame";
import CreateSparkAsFarcaster from "@/app/_components/CreateSparkAsFarcaster";
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
          <CreateSparkAsFarcaster fid={serverFid} />
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
          {fid && <CreateSparkAsFarcaster fid={fid} username={username ?? undefined} />}
          {serverFid === null && (
            <p className="mt-4 text-xs text-muted">
              {signInError ?? "Verifying your sign-in with the server..."}
            </p>
          )}
          <SignOutLink onDone={() => setServerFid(null)} />
        </section>
      )}
    </main>
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
      className="mt-6 text-xs text-muted underline hover:text-foreground"
    >
      Sign out
    </button>
  );
}

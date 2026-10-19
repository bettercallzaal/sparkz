"use client";

import { useEffect, useState } from "react";
import { SignInButton } from "@farcaster/auth-kit";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useSignMessage } from "wagmi";
import { createSiweMessage } from "viem/siwe";
import WalletProviders from "@/app/admin/empire/providers";
import { CANONICAL_HOST, CANONICAL_URL } from "@/lib/origin";
import {
  currentAdmin,
  exchangeSiwe,
  exchangeSiwf,
  fetchNonce,
  inMiniApp,
  miniAppSignIn,
} from "@/lib/auth-session-client";

// The admin sign-in panel for every /admin surface (Zaal's ruling, 2026-10-18). Two
// doors, both checked server-side against the admin allowlist:
//   1. Farcaster (SIWF on the web, Quick Auth in the mini app) as an admin FID.
//   2. Sign-In with Ethereum from an admin wallet (zaal.eth).
// Nobody types the admin token any more. `onSignedIn` runs once the server confirms
// the session is an admin session.
export default function AdminSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [miniApp, setMiniApp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inMiniApp().then(setMiniApp);
  }, []);

  async function confirmAdmin(signedIn: boolean) {
    if (!signedIn) {
      setError("Sign-in could not be verified. Try again.");
      return;
    }
    if (await currentAdmin()) {
      setError(null);
      onSignedIn();
    } else {
      setError("Signed in, but this account is not a Sparkz admin.");
    }
  }

  return (
    <div className="glass max-w-md space-y-5 p-5">
      <div>
        <h2 className="text-lg font-semibold">Admin sign-in</h2>
        <p className="mt-1 text-sm text-muted">
          Sign in with the Farcaster account or the wallet that is a Sparkz admin.
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">Farcaster</div>
        {miniApp ? (
          <button
            type="button"
            onClick={async () => confirmAdmin(Boolean(await miniAppSignIn().catch(() => null)))}
            className="btn-spark rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            Sign in with Farcaster
          </button>
        ) : (
          <SignInButton
            nonce={fetchNonce}
            onSuccess={async (res) => {
              if (!res.message || !res.signature) return;
              confirmAdmin(Boolean(await exchangeSiwf(res.message, res.signature)));
            }}
          />
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">Ethereum wallet</div>
        <WalletProviders>
          <EthereumSignIn onResult={(err) => (err ? setError(err) : confirmAdmin(true))} />
        </WalletProviders>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

function EthereumSignIn({ onResult }: { onResult: (error: string | null) => void }) {
  const { address, chainId } = useAccount();
  const { open } = useAppKit();
  const { signMessageAsync } = useSignMessage();
  const [busy, setBusy] = useState(false);

  async function signIn() {
    if (!address) {
      open();
      return;
    }
    setBusy(true);
    try {
      const issuedAt = new Date();
      const message = createSiweMessage({
        address,
        chainId: chainId ?? 8453,
        domain: CANONICAL_HOST,
        uri: `${CANONICAL_URL}/admin`,
        version: "1",
        nonce: await fetchNonce(),
        issuedAt,
        expirationTime: new Date(issuedAt.getTime() + 5 * 60_000),
        statement: "Sign in to the Sparkz admin console.",
      });
      const signature = await signMessageAsync({ message });
      onResult(await exchangeSiwe(message, signature));
    } catch {
      onResult("Wallet sign-in was cancelled.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={busy}
      className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:border-accent/60 disabled:opacity-60"
    >
      {busy ? "Check your wallet..." : address ? "Sign in with Ethereum" : "Connect wallet"}
    </button>
  );
}

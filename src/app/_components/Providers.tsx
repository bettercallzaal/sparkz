"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";
import { ToastProvider } from "./toast";
import { CANONICAL_HOST, CANONICAL_URL } from "@/lib/origin";

// App-wide Sign-In-With-Farcaster context, so the header, /profile, and the create
// flow can all read the signed-in identity. Protocol-native (no Neynar key); the
// signed message is verified against the key registry on Optimism. `domain` is a
// SIWE phishing guard - it must equal the serving host (single source: CANONICAL_HOST).
const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: CANONICAL_HOST,
  siweUri: `${CANONICAL_URL}/profile`,
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider config={config}>
      <ToastProvider>{children}</ToastProvider>
    </AuthKitProvider>
  );
}

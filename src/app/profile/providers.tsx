"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";

// Sign-In-With-Farcaster (protocol-native, free - no Neynar key). Reads the key
// registry on Optimism to verify the signed message; domain must match the host the
// sign-in happens on - the app domain, sparkz.lol (see src/lib/origins.ts).
const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "sparkz.lol",
  siweUri: "https://sparkz.lol/profile",
};

export default function FarcasterAuthProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>;
}

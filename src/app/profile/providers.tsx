"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";

// Sign-In-With-Farcaster (protocol-native, free - no Neynar key). Reads the key
// registry on Optimism to verify the signed message; domain must match the host.
const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "trysparkz.com",
  siweUri: "https://trysparkz.com/profile",
};

export default function FarcasterAuthProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>;
}

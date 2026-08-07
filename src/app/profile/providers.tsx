"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";
import { CANONICAL_HOST, CANONICAL_URL } from "@/lib/origin";

// Sign-In-With-Farcaster (protocol-native, free - no Neynar key). Reads the key
// registry on Optimism to verify the signed message; domain must match the host
// (single source: CANONICAL_HOST).
const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: CANONICAL_HOST,
  siweUri: `${CANONICAL_URL}/profile`,
};

export default function FarcasterAuthProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>;
}

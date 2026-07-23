"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";

// App-wide Sign-In-With-Farcaster context, so the header, /profile, and the create
// flow can all read the signed-in identity. Protocol-native (no Neynar key); the
// signed message is verified against the key registry on Optimism.
const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "trysparkz.com",
  siweUri: "https://trysparkz.com/profile",
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>;
}

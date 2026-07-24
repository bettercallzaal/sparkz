"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";
import { ToastProvider } from "./toast";

// App-wide Sign-In-With-Farcaster context, so the header, /profile, and the create
// flow can all read the signed-in identity. Protocol-native (no Neynar key); the
// signed message is verified against the key registry on Optimism.
// Sign-in lives on the app domain (sparkz.lol), so the SIWE message binds to it. The
// marketing domain (trysparkz.com) does not offer sign-in - its header sends people to
// the app to authenticate (see HeaderAuth).
const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "sparkz.lol",
  siweUri: "https://sparkz.lol/profile",
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider config={config}>
      <ToastProvider>{children}</ToastProvider>
    </AuthKitProvider>
  );
}

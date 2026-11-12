import type { CapacitorConfig } from "@capacitor/cli";

// Sparkz iPhone shell for TestFlight.
//
// Sparkz is a server-rendered Next.js app (API routes, middleware, Supabase), so it
// cannot be exported to static files and bundled into the app. The native shell is a
// thin WebView that loads the live site. Every deploy to Vercel updates the app with
// no new TestFlight build. `cap-www/` holds only the loading screen shown for the
// first second while the live site loads.
//
// To build: see docs/TESTFLIGHT.md (needs a Mac with Xcode).
const config: CapacitorConfig = {
  appId: "com.trysparkz.app",
  appName: "Sparkz",
  webDir: "cap-www",
  server: {
    url: "https://trysparkz.com",
    // Hosts the WebView may navigate to in-app. Anything else opens in Safari.
    allowNavigation: [
      "trysparkz.com",
      "*.trysparkz.com",
      "sparkz.lol",
      "*.vercel.app",
      "*.supabase.co",
      // Sign in with Farcaster relay + Warpcast web fallback
      "relay.farcaster.xyz",
      "*.farcaster.xyz",
      "warpcast.com",
      "*.warpcast.com",
      // Reown AppKit / WalletConnect
      "*.walletconnect.com",
      "*.walletconnect.org",
      "*.reown.com",
    ],
  },
  ios: {
    // Lets the site recognise the app (NativeShell.tsx) even if the native bridge
    // is not injected into the remote page.
    appendUserAgent: "SparkzApp",
    contentInset: "always",
    backgroundColor: "#0a0908",
    preferredContentMode: "mobile",
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: "#0a0908",
      showSpinner: false,
    },
  },
};

export default config;

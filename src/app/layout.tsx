import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./shell.css";
import MiniAppReady from "./_components/MiniAppReady";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import Providers from "./_components/Providers";
import NativeShell from "./_components/NativeShell";
import TabBar from "./_components/TabBar";
import NativeChrome from "./_components/NativeChrome";
import { ViewAsBar } from "./_components/ViewAs";
import { canonicalOrigin } from "@/lib/origin";

const ORIGIN = canonicalOrigin();

// Farcaster Mini App embed - makes a link to Sparkz render a launch card in-feed.
const fcMiniapp = JSON.stringify({
  version: "1",
  imageUrl: `${ORIGIN}/api/og`,
  button: {
    title: "Open Sparkz",
    action: {
      type: "launch_miniapp",
      name: "Sparkz",
      url: ORIGIN,
      splashImageUrl: `${ORIGIN}/api/icon`,
      splashBackgroundColor: "#0a0a0a",
    },
  },
});

// ZAO type system: Space Grotesk carries both body and headings; JetBrains Mono is the
// stats/address/receipt face. This is what makes Sparkz visibly share DNA with the rest
// of the ZAO estate (WaveWarZ, COC Concertz, ZABAL) instead of reading Farcaster-default.
//
// Self-hosted (next/font/local) since 12 Nov 2026: next/font/google fetches from
// fonts.gstatic at build time, and that fetch failed two Vercel builds that day
// (one of them production). Files are the Latin variable-weight woff2 from
// Fontsource 5.3.0, SIL Open Font License 1.1 (licence texts next to them).
const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-geist-mono",
  weight: "100 800",
  display: "swap",
});

// Native shell (Capacitor) and notched iPhones: draw under the status bar and pad with
// the safe-area insets in globals.css. No effect in a normal browser tab.
export const viewport: Viewport = {
  themeColor: "#0a0908",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  title: {
    default: "Sparkz - light a Hearth, grow it with sparks",
    template: "%s - Sparkz",
  },
  description:
    "Every Sparkz project is a Hearth. Every show, drop and launch is a Spark that grows it. Back the album, back the show.",
  applicationName: "Sparkz",
  openGraph: {
    title: "Sparkz - light a Hearth, grow it with sparks",
    description:
      "Every Sparkz project is a Hearth. Every show, drop and launch is a Spark that grows it. Back the album, back the show.",
    siteName: "Sparkz",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 800 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sparkz - light a Hearth, grow it with sparks",
    description: "Back the album, back the show.",
    images: ["/api/og"],
  },
  other: {
    "fc:miniapp": fcMiniapp,
    // back-compat alias some clients still read
    "fc:frame": fcMiniapp,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      // Browser extensions (Grammarly, Scribe recorder, etc) inject attributes on
      // <html>/<body> before React hydrates, which triggers a dev-only hydration
      // mismatch warning. Suppress it at the root - it's noise from the client env,
      // not our markup.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Providers>
          <MiniAppReady />
          <NativeShell />
          <NativeChrome />
          <ViewAsBar />
          <Header />
          {children}
          <Footer />
          <TabBar />
        </Providers>
      </body>
    </html>
  );
}

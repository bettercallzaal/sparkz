import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import MiniAppReady from "./_components/MiniAppReady";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import Providers from "./_components/Providers";
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
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  title: {
    default: "Sparkz - start with a spark, not a token",
    template: "%s - Sparkz",
  },
  description:
    "Every Sparkz project is a Capsule, not a coin. Back the album, not buy a coin.",
  applicationName: "Sparkz",
  openGraph: {
    title: "Sparkz - start with a spark, not a token",
    description:
      "Every Sparkz project is a Capsule, not a coin. Back the album, not buy a coin.",
    siteName: "Sparkz",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 800 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sparkz - start with a spark, not a token",
    description: "Back the album, not buy a coin.",
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
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

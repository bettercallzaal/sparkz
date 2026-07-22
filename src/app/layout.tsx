import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import MiniAppReady from "./_components/MiniAppReady";

// Farcaster Mini App embed - makes a link to Sparkz render a launch card in-feed.
const fcMiniapp = JSON.stringify({
  version: "1",
  imageUrl: "https://trysparkz.com/api/og",
  button: {
    title: "Open Sparkz",
    action: {
      type: "launch_miniapp",
      name: "Sparkz",
      url: "https://trysparkz.com",
      splashImageUrl: "https://trysparkz.com/api/icon",
      splashBackgroundColor: "#0a0a0a",
    },
  },
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for headings - the "instant premium upgrade" (Zora-style).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trysparkz.com"),
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
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MiniAppReady />
        {children}
      </body>
    </html>
  );
}

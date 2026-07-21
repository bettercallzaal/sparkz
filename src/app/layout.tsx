import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Sparkz - start with a spark, not a token",
    description: "Back the album, not buy a coin.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

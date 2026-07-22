import { NextResponse } from "next/server";

// Farcaster Mini App manifest. Served at /.well-known/farcaster.json.
// CRITICAL: the domain in the accountAssociation payload MUST equal the hosting
// FQDN exactly - here the apex `trysparkz.com` (www + vercel.app redirect to it).
// The accountAssociation is a JFS signature by a Farcaster custody key proving the
// fid owns trysparkz.com; generate it with the Farcaster manifest tool
// (farcaster.xyz/~/developers) and set the three env vars below.
export const dynamic = "force-static";

const ORIGIN = "https://trysparkz.com";

export function GET() {
  const header = process.env.FARCASTER_HEADER;
  const payload = process.env.FARCASTER_PAYLOAD;
  const signature = process.env.FARCASTER_SIGNATURE;

  const manifest: Record<string, unknown> = {
    miniapp: {
      version: "1",
      name: "Sparkz",
      homeUrl: ORIGIN,
      iconUrl: `${ORIGIN}/api/icon`,
      imageUrl: `${ORIGIN}/api/og`,
      buttonTitle: "Open Sparkz",
      splashImageUrl: `${ORIGIN}/api/icon`,
      splashBackgroundColor: "#0a0a0a",
      subtitle: "Start with a spark, not a token",
      description:
        "Every Sparkz project is a Capsule, not a coin. Build community and backing first; tokenize later only if it fits.",
      primaryCategory: "social",
      tags: ["creators", "base", "farcaster", "backing", "capsule"],
      heroImageUrl: `${ORIGIN}/api/og`,
      tagline: "Back the work, not a coin.",
      ogTitle: "Sparkz",
      ogDescription: "Start with a spark, not a token.",
      ogImageUrl: `${ORIGIN}/api/og`,
    },
  };

  if (header && payload && signature) {
    manifest.accountAssociation = { header, payload, signature };
  }

  return NextResponse.json(manifest);
}

import { NextResponse } from "next/server";
import { CANONICAL_HOST, CANONICAL_URL } from "@/lib/origin";

// Farcaster Mini App manifest. Served at /.well-known/farcaster.json.
// CRITICAL: the domain in the accountAssociation payload MUST equal the hosting
// FQDN exactly - here the apex `trysparkz.com` (www + vercel.app redirect to it).
// The accountAssociation is a JFS signature by a Farcaster custody key proving the
// fid owns trysparkz.com; generate it with the Farcaster manifest tool
// (farcaster.xyz/~/developers) and set the three env vars below. This host is
// signature-bound, so it uses the pinned CANONICAL_* literals, NOT canonicalOrigin()
// (a SPARKZ_ORIGIN env change must not silently break the signed manifest).
export const dynamic = "force-static";

const ORIGIN = CANONICAL_URL;

export function GET() {
  const header = process.env.FARCASTER_HEADER;
  const payload = process.env.FARCASTER_PAYLOAD;
  const signature = process.env.FARCASTER_SIGNATURE;

  const manifest: Record<string, unknown> = {
    miniapp: {
      version: "1",
      name: "Sparkz",
      homeUrl: ORIGIN,
      canonicalDomain: CANONICAL_HOST,
      iconUrl: `${ORIGIN}/api/icon`,
      imageUrl: `${ORIGIN}/api/og`,
      buttonTitle: "Open Sparkz",
      splashImageUrl: `${ORIGIN}/api/icon`,
      splashBackgroundColor: "#0a0a0a",
      subtitle: "Start with a spark, not a token",
      description:
        "Every Sparkz project is a Hearth, not a coin. Build community and backing first; tokenize later only if it fits.",
      primaryCategory: "social",
      tags: ["creators", "base", "farcaster", "backing", "hearth"],
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

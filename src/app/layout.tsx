import type { Metadata } from 'next'
import './globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_IMAGE = `${BASE_URL}/api/og`

export const metadata: Metadata = {
  title: 'Sparkz — Back the Work, Build the Collective',
  description:
    'Start with a spark, not a token. Collectables, community backing, fee splits, and a boost engine — all without a coin. A token is opt-in, later, if ever.',
  openGraph: {
    title: 'Sparkz — Back the Work, Build the Collective',
    description: 'No token required to get started. Back the album, not buy a coin.',
    type: 'website',
    url: BASE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Sparkz — Start with a spark, not a token.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sparkz — Back the Work, Build the Collective',
    description: 'Feature-first, coin-last. Back the album, not the coin.',
    images: [OG_IMAGE],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_IMAGE,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '⚡ Start with a spark',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': BASE_URL,
    'fc:frame:button:2': '📖 See examples',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/examples`,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

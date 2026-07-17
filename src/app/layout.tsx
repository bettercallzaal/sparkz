import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sparkz — Back the Work, Build the Collective',
  description:
    'Start with a spark, not a token. Collectables, community backing, fee splits, and a boost engine — all without a coin. A token is opt-in, later, if ever.',
  openGraph: {
    title: 'Sparkz — Back the Work, Build the Collective',
    description: 'No token required to get started. Back the album, not buy a coin.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
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
      <body>
        {children}
        <footer className="border-t border-zao-border bg-zao-card">
          <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="grid sm:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="font-black text-lg mb-2">
                  <span className="text-gradient-gold">SPAR</span>
                  <span className="text-white">KZ</span>
                </div>
                <p className="text-xs text-slate-500">
                  Built by ZAO. Feature-first, coin-last.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tools</h4>
                <div className="space-y-1.5">
                  <FooterLink href="/advisor">Split advisor</FooterLink>
                  <FooterLink href="/split-wizard">Split sheet wizard</FooterLink>
                  <FooterLink href="/tiers">Patronage tiers</FooterLink>
                  <FooterLink href="/back">Fan backing</FooterLink>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Learn</h4>
                <div className="space-y-1.5">
                  <FooterLink href="/how-it-works">How it works</FooterLink>
                  <FooterLink href="/collectables">Collectables</FooterLink>
                  <FooterLink href="/examples">Spark examples</FooterLink>
                  <FooterLink href="/audius">Audius integration</FooterLink>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">ZAO</h4>
                <div className="space-y-1.5">
                  <FooterLink href="/vetted">Get vetted</FooterLink>
                  <FooterLink href="/launches">Live launches</FooterLink>
                  <FooterLink href="https://zoostr.xyz">Zoostr (first launch)</FooterLink>
                  <FooterLink href="https://github.com/bettercallzaal/sparkz">GitHub</FooterLink>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 text-center">
              Not financial advice. Perks reflect what backers enjoy today — not guaranteed entitlements.
              Sparkz is a monetization tool, not a securities offering.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http')
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-slate-400 hover:text-gold-400 transition-colors block"
      >
        {children} ↗
      </a>
    )
  }
  return (
    <Link href={href} className="text-sm text-slate-400 hover:text-gold-400 transition-colors block">
      {children}
    </Link>
  )
}

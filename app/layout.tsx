import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oddsloom.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OddsLoom — Data-Backed Sports Picks',
    template: '%s | OddsLoom',
  },
  description:
    'Sharp, data-backed sports picks built from live odds, market movement, and disciplined analysis. Get every pick before the line moves.',
  keywords: [
    'sports picks',
    'sports betting analysis',
    'betting odds',
    'closing line value',
    'data-backed picks',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'OddsLoom',
    title: 'OddsLoom — Find the edge before it moves',
    description: 'Data-backed sports picks delivered while the number is still playable.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OddsLoom — Find the edge before it moves',
    description: 'Data-backed sports picks delivered while the number is still playable.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'sports',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0b0a',
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'OddsLoom',
  url: siteUrl,
  description: 'Data-backed sports picks and betting market analysis.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </html>
  )
}

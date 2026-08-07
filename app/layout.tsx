import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oddsloom.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OddsLoom — Real-Time Sportsbook Odds API',
    template: '%s | OddsLoom',
  },
  description:
    'Normalized real-time sportsbook odds infrastructure for developers, quantitative systems, and data-driven applications.',
  keywords: [
    'real-time odds API',
    'sportsbook odds API',
    'live odds data feed',
    'sports betting data API',
    'WebSocket odds feed',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'OddsLoom',
    title: 'OddsLoom — Real-time odds infrastructure',
    description: 'A normalized live sportsbook odds feed built for developers and automated systems.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OddsLoom — Real-time odds infrastructure',
    description: 'A normalized live sportsbook odds feed built for developers and automated systems.',
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
  description: 'Normalized real-time sportsbook odds infrastructure for software and automated systems.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c'),
          }}
        />
        {children}
      </body>
    </html>
  )
}

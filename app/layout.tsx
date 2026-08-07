import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oddsloom.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OddsLoom — Live Sportsbook Odds in One Place',
    template: '%s | OddsLoom',
  },
  description:
    'Compare live sportsbook odds, prices, and line movement across the market in one fast, focused view.',
  keywords: [
    'live sports odds',
    'sportsbook odds comparison',
    'betting odds',
    'closing line value',
    'line movement',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'OddsLoom',
    title: 'OddsLoom — Every line, as it moves',
    description: 'Compare live sportsbook odds and line movement across the market in one clear view.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OddsLoom — Every line, as it moves',
    description: 'Compare live sportsbook odds and line movement across the market in one clear view.',
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
  description: 'Live sportsbook odds aggregation and market comparison.',
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

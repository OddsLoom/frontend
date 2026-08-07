import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oddsloom.com'
  const routes = ['', '/about', '/docs', '/docs/protocol', '/docs/entities', '/docs/payloads', '/docs/reliability', '/beta', '/coverage', '/privacy', '/terms']

  return routes.map((route, index) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: index === 0 ? 'weekly' : 'monthly',
      priority: index === 0 ? 1 : route === '/docs' || route === '/beta' ? 0.9 : 0.6,
    }))
}

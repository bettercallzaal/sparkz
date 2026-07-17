import type { MetadataRoute } from 'next'
import { SPARK_EXAMPLES } from '@/lib/spark-examples'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'

export default function sitemap(): MetadataRoute.Sitemap {
  const examplePages: MetadataRoute.Sitemap = SPARK_EXAMPLES.map((ex) => ({
    url: `${BASE}/examples/${ex.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/advisor`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/split-wizard`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/tiers`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/back`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/vetted`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/collectables`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/how-it-works`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/launches`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/examples`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/audius`, changeFrequency: 'monthly', priority: 0.6 },
    ...examplePages,
  ]
}

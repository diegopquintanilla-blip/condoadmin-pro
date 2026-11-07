import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://condominpro.com'
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/demo`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/software-administracion-condominios`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/gestion-edificios-residenciales`, changeFrequency: 'monthly', priority: 0.8 },
  ]
}

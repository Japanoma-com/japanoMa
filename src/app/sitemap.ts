import type { MetadataRoute } from 'next';
import { getAllCitySlugs } from '@/lib/db/queries';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://japanoma.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${SITE_URL}/areas`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${SITE_URL}/quiz`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  let cityPages: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllCitySlugs();
    cityPages = slugs.map((s) => ({
      url: `${SITE_URL}/areas/${s.prefectureSlug}/${s.citySlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable during build
  }

  return [...staticPages, ...cityPages];
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://japanoma.vercel.app';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Japanoma',
    description: 'A decision-aid platform helping Australian ski-lovers decide whether to buy a home base in Northern Japan snow country.',
    url: SITE_URL,
    founder: { '@type': 'Person', name: 'Kaz Yasumura' },
    areaServed: { '@type': 'Country', name: 'Australia' },
  };
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Japanoma',
    url: SITE_URL,
  };
}

export function placeJsonLd(city: {
  cityName: string;
  cityNameJa?: string | null;
  prefectureName: string;
  description?: string | null;
  citySlug: string;
  prefectureSlug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${city.cityName}, ${city.prefectureName}`,
    description: city.description || `${city.cityName} in ${city.prefectureName} prefecture, Japan.`,
    address: {
      '@type': 'PostalAddress',
      addressRegion: city.prefectureName,
      addressCountry: 'JP',
    },
    url: `${SITE_URL}/areas/${city.prefectureSlug}/${city.citySlug}`,
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    image: article.image,
    url: `${SITE_URL}/content/${article.slug}`,
    publisher: organizationJsonLd(),
  };
}

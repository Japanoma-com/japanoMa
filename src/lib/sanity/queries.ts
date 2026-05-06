import { sanityClient } from './client';

// Dereference tag refs to plain title strings so consumers get string[].
// Filter logic uses slug (see getFilteredArticles).
const TAG_PROJECTIONS = `
  "areaTags": areaTags[]->title,
  "propertyTypeTags": propertyTypeTags[]->title,
  "useCaseTags": useCaseTags[]->title,
  "phase": phase->phaseId,
  "buyerTypes": buyerTypes[]->buyerTypeId
`;

export async function getArticles() {
  return sanityClient.fetch(
    `*[_type == "article"] | order(publishedAt desc) {
      _id, title, slug, excerpt, featuredImage, publishedAt,
      "areaTags": areaTags[]->title
    }`
  );
}

export async function getArticleBySlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      _id, title, slug, excerpt, body, featuredImage, publishedAt,
      "areaTags": areaTags[]->{title, "slug": slug.current},
      "propertyTypeTags": propertyTypeTags[]->{title, "slug": slug.current},
      "useCaseTags": useCaseTags[]->{title, "slug": slug.current}
    }`,
    { slug }
  );
}

export async function getAreaGuides() {
  return sanityClient.fetch(
    `*[_type == "areaGuide"] | order(name asc) {
      _id, name, slug, prefectureSlug, description, images
    }`
  );
}

export async function getAreaGuideBySlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "areaGuide" && slug.current == $slug][0]`,
    { slug }
  );
}

/**
 * Articles tagged with any of the given area slugs. Used on the city
 * detail page where we want articles tagged at either the city level
 * ("iiyama") OR its parent prefecture ("nagano") — articles about a
 * prefecture are usually relevant to its cities, and Kaz tends to tag
 * at prefecture granularity.
 */
export async function getArticlesByAreaSlugs(areaSlugs: string[], limit = 6) {
  if (areaSlugs.length === 0) return [];
  return sanityClient.fetch(
    `*[_type == "article" && count((areaTags[]->slug.current)[@ in $areaSlugs]) > 0]
      | order(publishedAt desc) [0...$limit] {
        _id, title, slug, excerpt, featuredImage, publishedAt,
        "areaTags": areaTags[]->title
      }`,
    { areaSlugs, limit }
  );
}

/** @deprecated Use getArticlesByAreaSlugs([slug]). */
export async function getArticlesByAreaSlug(areaSlug: string, limit = 6) {
  return getArticlesByAreaSlugs([areaSlug], limit);
}

export async function getPageBySlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "page" && slug.current == $slug][0] {
      _id, title, slug, body
    }`,
    { slug }
  );
}

export type TagOption = { title: string; slug: string };

export async function getAllTags(): Promise<{
  area: TagOption[];
  propertyType: TagOption[];
  useCase: TagOption[];
}> {
  const [area, propertyType, useCase] = await Promise.all([
    sanityClient.fetch(`*[_type == "areaTag"] | order(title asc) { title, "slug": slug.current }`),
    sanityClient.fetch(`*[_type == "propertyTypeTag"] | order(title asc) { title, "slug": slug.current }`),
    sanityClient.fetch(`*[_type == "useCaseTag"] | order(title asc) { title, "slug": slug.current }`),
  ]);
  return { area, propertyType, useCase };
}

export type ArticleFilters = {
  area?: string;
  propertyType?: string;
  useCase?: string;
  phase?: string;       // phaseId, e.g. '5_due_diligence'
  buyerType?: string;   // buyerTypeId, e.g. 'remote'
};

export async function getFilteredArticles(
  filters: ArticleFilters = {},
  page = 0,
  perPage = 12
) {
  const conditions = ['_type == "article"'];
  const params: Record<string, string> = {};

  if (filters.area) {
    conditions.push('$area in areaTags[]->slug.current');
    params.area = filters.area;
  }
  if (filters.propertyType) {
    conditions.push('$propertyType in propertyTypeTags[]->slug.current');
    params.propertyType = filters.propertyType;
  }
  if (filters.useCase) {
    conditions.push('$useCase in useCaseTags[]->slug.current');
    params.useCase = filters.useCase;
  }
  if (filters.phase) {
    conditions.push('phase->phaseId == $phase');
    params.phase = filters.phase;
  }
  if (filters.buyerType) {
    conditions.push('$buyerType in buyerTypes[]->buyerTypeId');
    params.buyerType = filters.buyerType;
  }

  const filter = conditions.join(' && ');
  const start = page * perPage;
  const end = start + perPage;

  const [articles, total] = await Promise.all([
    sanityClient.fetch(
      `*[${filter}] | order(publishedAt desc) [${start}...${end}] {
        _id, title, slug, excerpt, featuredImage, publishedAt,
        ${TAG_PROJECTIONS}
      }`,
      params
    ),
    sanityClient.fetch(`count(*[${filter}])`, params),
  ]);

  return { articles, total, hasMore: end < total };
}

export async function getRelatedArticles(slug: string, tags: string[], limit = 3) {
  return sanityClient.fetch(
    `*[_type == "article" && slug.current != $slug && count((areaTags[]->title + propertyTypeTags[]->title + useCaseTags[]->title)[@ in $tags]) > 0] | order(publishedAt desc) [0...$limit] {
      _id, title, slug, excerpt, featuredImage, publishedAt,
      "areaTags": areaTags[]->title
    }`,
    { slug, tags, limit }
  );
}

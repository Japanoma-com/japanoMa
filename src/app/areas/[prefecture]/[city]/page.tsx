import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityBySlug, getAllCitySlugs } from '@/lib/db/queries';
import {
  MaDivider,
  ScrollReveal,
  CityActions,
} from '@/components/japandi';
import { placeJsonLd, breadcrumbJsonLd } from '@/lib/seo/json-ld';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSavedKeys } from '@/app/account/save-actions';
import { formatPriceFromJpy, rateFootnote } from '@/lib/format/price';
import { getArticlesByAreaSlugs } from '@/lib/sanity/queries';
import { ArticleCard } from '@/components/content/article-card';
import { getOrigin } from '@/lib/format/origin-actions';
import { CityHero } from './city-hero';
import { JaCopyChip } from '@/components/japandi/ja-copy-chip';
import { TravelTimeGrid } from './travel-time-grid';

type Props = {
  params: Promise<{ prefecture: string; city: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { prefecture, city: citySlug } = await params;
  const city = await getCityBySlug(prefecture, citySlug);
  if (!city) return {};
  return {
    title: `${city.cityName} | ${city.prefectureName}`,
    description: city.description || `Explore ${city.cityName} in ${city.prefectureName} prefecture.`,
    alternates: { canonical: `/areas/${city.prefectureSlug}/${city.citySlug}` },
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllCitySlugs();
    return slugs.map((s) => ({
      prefecture: s.prefectureSlug,
      city: s.citySlug,
    }));
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function CityDetailPage({ params }: Props) {
  const { prefecture, city: citySlug } = await params;
  const [city, origin] = await Promise.all([
    getCityBySlug(prefecture, citySlug),
    getOrigin(),
  ]);

  if (!city) notFound();

  // Auth state + saved-set lookup for the Save button initial state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  const savedKeys = isAuthenticated ? await getCurrentUserSavedKeys() : new Set<string>();
  const initialSaved = savedKeys.has(`city:${city.citySlug}`);

  // Sanity articles tagged with this city's slug (lib/sanity/queries.ts).
  // Defensive: fall back to empty list if Sanity is unreachable.
  let relatedArticles: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    excerpt?: string;
    publishedAt?: string;
    areaTags?: string[];
    featuredImage?: { asset: { _ref: string } };
  }> = [];
  try {
    // Match articles tagged at either the city level (iiyama) or the
    // parent prefecture (nagano). Most of Kaz's articles tag at
    // prefecture level, so the city-only match would miss them.
    relatedArticles = await getArticlesByAreaSlugs(
      [city.citySlug, city.prefectureSlug],
      6
    );
  } catch {
    relatedArticles = [];
  }

  return (
    <div className="pb-ma-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            placeJsonLd(city),
            breadcrumbJsonLd([
              { name: 'Home', href: '/' },
              { name: 'Areas', href: '/areas' },
              { name: city.prefectureName, href: `/areas` },
              { name: city.cityName, href: `/areas/${city.prefectureSlug}/${city.citySlug}` },
            ]),
          ]),
        }}
      />
      {/* Hero — image (when available) with title overlay, or
          branded gradient placeholder with identical layout */}
      <CityHero
        cityName={city.cityName}
        cityNameJa={city.cityNameJa}
        prefectureName={city.prefectureName}
        regionType={city.regionType}
        heroImagePath={city.heroImagePath}
        citySlug={city.citySlug}
      />

      <div className="ma-page px-ma-6 mt-ma-12">
        <div className="ma-content mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-ma-8 text-sm text-stone">
          <Link href="/areas" className="hover:text-sumi-light transition-colors duration-base ease-settle">
            Areas
          </Link>
          <span className="mx-ma-2">/</span>
          <span>{city.prefectureName}</span>
          <span className="mx-ma-2">/</span>
          <span className="text-sumi-light">{city.cityName}</span>
        </nav>

        <CityActions
          citySlug={city.citySlug}
          cityName={city.cityName}
          prefectureSlug={city.prefectureSlug}
          prefectureName={city.prefectureName}
          isAuthenticated={isAuthenticated}
          initialSaved={initialSaved}
        />

        {/* Japanese-name copy chips. Australian buyers paste these
            into partner sites that only search in Japanese — Hazard
            Map, Yukiyama snow reports, municipal websites. Click
            copies, the small links beneath open the partner sites
            in a new tab so they can paste-and-search. */}
        {(city.cityNameJa || city.prefectureNameJa) && (
          <div className="mt-ma-8 flex flex-col gap-ma-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone font-medium">
              Japanese names · click to copy
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-ma-6">
              {city.cityNameJa && (
                <JaCopyChip
                  nameJa={city.cityNameJa}
                  size="md"
                  ariaLabel={`Copy ${city.cityNameJa} (${city.cityName} in Japanese) to clipboard`}
                />
              )}
              {city.prefectureNameJa && (
                <JaCopyChip
                  nameJa={city.prefectureNameJa}
                  size="md"
                  ariaLabel={`Copy ${city.prefectureNameJa} (${city.prefectureName} prefecture in Japanese) to clipboard`}
                />
              )}
            </div>
          </div>
        )}

        {/* Hero carries the title; body opens with description.
            Old <h1> here was a duplicate and has been removed. */}
        {city.description && (
          <ScrollReveal>
            <p className="text-sumi-light leading-body mb-ma-16 text-lg max-w-2xl">
              {city.description}
            </p>
          </ScrollReveal>
        )}

        <MaDivider size="breath" line />

        {/* Access Information */}
        <section className="mb-ma-16">
          <ScrollReveal>
            <h2 className="mb-ma-8">Access</h2>
          </ScrollReveal>
          <div className="grid gap-ma-6 sm:grid-cols-2">
            {city.closestAirport && (
              <div>
                <p className="label-overline text-stone mb-ma-2">Closest airport</p>
                <p className="text-sumi">{city.closestAirport}</p>
                {city.airportTimeMin && (
                  <p className="text-sm text-stone mt-ma-1">{city.airportTimeMin} min</p>
                )}
              </div>
            )}
            {city.closestStation && (
              <div>
                <p className="label-overline text-stone mb-ma-2">Closest station</p>
                <p className="text-sumi">{city.closestStation}</p>
                {city.stationTimeMin && (
                  <p className="text-sm text-stone mt-ma-1">{city.stationTimeMin} min</p>
                )}
              </div>
            )}
            {city.population !== null && city.population !== undefined && (
              <div>
                <p className="label-overline text-stone mb-ma-2">Population</p>
                <p className="text-sumi tabular-nums">
                  {city.population.toLocaleString('en-AU')}
                </p>
                <p className="text-xs text-stone mt-ma-1">As of April 2026</p>
              </div>
            )}
            {city.municipalityUrl && (
              <div>
                <p className="label-overline text-stone mb-ma-2">
                  Official town site
                </p>
                <a
                  href={city.municipalityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ai hover:text-ai-deep underline underline-offset-[3px] transition-colors duration-base ease-settle break-all"
                >
                  Visit {city.cityName} ↗
                </a>
                <p className="text-xs text-stone mt-ma-1">
                  Linked with the town&apos;s permission.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* For Australian buyers — CRA-76 enrichment fields */}
        {(city.timeFromSydney ||
          city.avgPropertyPriceJpy ||
          city.offSeasonActivitiesScore !== null) && (
          <section className="mb-ma-16">
            <MaDivider size="breath" line />
            <ScrollReveal>
              <p className="label-overline text-ai mb-ma-2">For Australian buyers</p>
              <h2 className="mb-ma-8">How this area stacks up.</h2>
            </ScrollReveal>

            <TravelTimeGrid
              initialOrigin={origin}
              times={{
                sydney: city.timeFromSydney,
                melbourne: city.timeFromMelbourne,
                brisbane: city.timeFromBrisbane,
                perth: city.timeFromPerth,
                adelaide: city.timeFromAdelaide,
              }}
            />

            <div className="grid sm:grid-cols-2 gap-ma-6">
              {city.avgPropertyPriceJpy !== null &&
                city.avgPropertyPriceJpy !== undefined && (() => {
                  const price = formatPriceFromJpy(city.avgPropertyPriceJpy);
                  return (
                    <div>
                      <p className="label-overline text-stone mb-ma-2">
                        Average property price
                      </p>
                      <p className="text-sumi font-editorial text-2xl tabular-nums">
                        {price.primaryFull}
                      </p>
                      <p className="text-xs text-stone mt-ma-1">
                        {price.secondary}
                      </p>
                    </div>
                  );
                })()}
              {city.offSeasonActivitiesScore !== null &&
                city.offSeasonActivitiesScore !== undefined && (
                  <div>
                    <p className="label-overline text-stone mb-ma-2">
                      Off-season appeal
                    </p>
                    <div className="flex items-baseline gap-ma-2 min-h-[2rem]">
                      <p className="text-sumi font-editorial text-2xl tabular-nums">
                        {city.offSeasonActivitiesScore}
                      </p>
                      <p className="text-stone text-sm">/ 10</p>
                    </div>
                    <p className="text-xs text-stone mt-ma-1">
                      Higher = stronger year-round reasons to visit (hiking,
                      onsen, cultural).
                    </p>
                  </div>
                )}
            </div>

            {city.avgPropertyPriceJpy !== null &&
              city.avgPropertyPriceJpy !== undefined && (
                <p className="text-[11px] text-stone mt-ma-6 italic">
                  {rateFootnote}. Indicative only — actual listings will vary.
                </p>
              )}
          </section>
        )}

        {city.notes && (
          <section className="mb-ma-16">
            <h2 className="mb-ma-8">Notes</h2>
            <p className="text-sumi-light leading-body">{city.notes}</p>
          </section>
        )}

        {/* Sanity articles tagged with this city or its prefecture */}
        {relatedArticles.length > 0 && (
          <section>
            <MaDivider size="breath" line />
            <ScrollReveal>
              <p className="label-overline text-ai mb-ma-2">
                Reading about {city.cityName} &amp; {city.prefectureName}
              </p>
              <h2 className="mb-ma-8">
                {relatedArticles.length === 1
                  ? '1 article'
                  : `${relatedArticles.length} articles`}{' '}
                for you.
              </h2>
            </ScrollReveal>
            <div className="grid gap-ma-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((article) => (
                <ArticleCard
                  key={article._id}
                  title={article.title}
                  slug={article.slug.current}
                  excerpt={article.excerpt}
                  publishedAt={article.publishedAt}
                  areaTags={article.areaTags}
                  featuredImage={article.featuredImage}
                />
              ))}
            </div>
            <div className="mt-ma-8">
              <Link
                href={`/content?area=${city.prefectureSlug}`}
                className="text-sm text-ai hover:text-ai-deep underline underline-offset-2"
              >
                See all articles about {city.prefectureName} →
              </Link>
            </div>
          </section>
        )}
        </div>
      </div>
    </div>
  );
}

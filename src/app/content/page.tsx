import { Suspense } from 'react';
import { getFilteredArticles } from '@/lib/sanity/queries';
import { ArticleCard } from '@/components/content/article-card';
import { FilterBar } from '@/components/content/filter-bar';
import { MaDivider, ScrollReveal } from '@/components/japandi';
import { ButtonLink } from '@/components/ui/button-link';
import { logEvent } from '@/lib/events/log';
import { PhaseFilterPrimaryRow } from '@/components/journey/phase-filter-primary-row';
import { getJourneyState, ANONYMOUS_INITIAL_STATE } from '@/lib/journey/queries';
import { createClient } from '@/lib/supabase/server';
import type { Phase } from '@/lib/journey/types';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    area?: string;
    type?: string;
    use?: string;
    phase?: string;
    buyerType?: string;
    page?: string;
  }>;
};

export default async function ContentPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || '0', 10);

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const journeyState = user
    ? await getJourneyState(user.id)
    : ANONYMOUS_INITIAL_STATE;
  const activePhase = (params.phase ?? null) as Phase | null;

  let articles: { _id: string; title: string; slug: { current: string }; excerpt?: string; publishedAt?: string; areaTags?: string[] }[] = [];
  let total = 0;
  let hasMore = false;
  try {
    const result = await getFilteredArticles(
      {
        area: params.area,
        propertyType: params.type,
        useCase: params.use,
        phase: params.phase,
        buyerType: params.buyerType,
      },
      page,
      12
    );
    articles = result.articles;
    total = result.total;
    hasMore = result.hasMore;
  } catch {
    // Sanity unavailable — show empty state
  }

  // Emit filter_apply only when a filter is actually present — this is what
  // the dashboard cares about; the bare /content landing doesn't need noise.
  if (params.area || params.type || params.use || params.phase || params.buyerType) {
    void logEvent('filter_apply', {
      area: params.area ?? null,
      propertyType: params.type ?? null,
      useCase: params.use ?? null,
      phase: params.phase ?? null,
      buyerType: params.buyerType ?? null,
      page,
      resultCount: total,
    });
  }

  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        <ScrollReveal>
          <p className="label-overline text-stone mb-ma-4">Guides & Insights</p>
          <h1 className="mb-ma-6">Content Hub</h1>
          <p className="text-sumi-light leading-body mb-ma-8">
            Practical advice for buying a ski home base in Northern Japan.
          </p>
        </ScrollReveal>

        <PhaseFilterPrimaryRow
          state={journeyState}
          activePhase={activePhase}
          baseUrl="/content"
        />

        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>
      </div>

      <MaDivider size="breath" line />

      <div className="ma-content mx-auto">
        {articles.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-ma-24">
              <p className="text-stone mb-ma-4">No articles match your filters.</p>
              <ButtonLink href="/content" variant="outline" size="sm">
                Clear filters
              </ButtonLink>
            </div>
          </ScrollReveal>
        ) : (
          <>
            <p className="text-xs text-stone mb-ma-8">Showing {Math.min((page + 1) * 12, total)} of {total} article{total !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ma-4">
              {articles.map((article: { _id: string; title: string; slug: { current: string }; excerpt?: string; publishedAt?: string; areaTags?: string[]; featuredImage?: { asset: { _ref: string } } }) => (
                <ScrollReveal key={article._id}>
                  <ArticleCard
                    title={article.title}
                    slug={article.slug.current}
                    excerpt={article.excerpt}
                    publishedAt={article.publishedAt}
                    featuredImage={article.featuredImage}
                    areaTags={article.areaTags}
                  />
                </ScrollReveal>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-ma-12">
                <ButtonLink
                  href={`/content?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                  variant="outline"
                  size="sm"
                >
                  Load more
                </ButtonLink>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

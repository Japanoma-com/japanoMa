import { Suspense } from 'react';
import {
  getAreaInterest,
  getDailyEventTrend,
  getDailyMetricSeries,
  getEventsByTypeBreakdown,
  getOverviewStats,
  getQuizFunnel,
  getRecentLeads,
  getTopArticles,
} from '@/lib/admin/queries';
import { parseRangeOrDefault, toIsoDate } from '@/lib/admin/range';
import { StatCard } from '@/components/admin/stat-card';
import { AdminSection } from '@/components/admin/admin-section';
import { ConversionFunnel } from '@/components/admin/conversion-funnel';
import { EventTrendChart } from '@/components/admin/event-trend-chart';
import { DonutChart } from '@/components/admin/donut-chart';
import { HorizontalBarList } from '@/components/admin/horizontal-bar-list';
import { InsightCard } from '@/components/admin/insight-card';
import {
  HeroRowSkeleton,
  ThreeCardRowSkeleton,
  TwoCardRowSkeleton,
} from '@/components/admin/skeletons';
import type { DateRange } from '@/lib/admin/queries';

export const metadata = {
  title: 'Overview · Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

/**
 * Overview is a streaming page. The shell (header + layout) renders
 * immediately; each section fetches its own data behind a Suspense
 * boundary so the fastest cards paint first. Users see the layout +
 * date-range controls in ~100ms instead of waiting for the slowest
 * query in a single Promise.all.
 */
export default async function AdminOverviewPage({ searchParams }: Props) {
  const params = await searchParams;
  const range = parseRangeOrDefault(params, 30);

  return (
    <div className="space-y-ma-12">
      <AdminSection
        overline="Overview"
        title="Command center"
        subtitle="Conversion pulse, activity mix, who's warm."
        range={range}
      />

      <Suspense fallback={<HeroRowSkeleton />}>
        <HeroSection range={range} />
      </Suspense>

      <Suspense fallback={<TwoCardRowSkeleton leftSpan={2} rightSpan={1} />}>
        <ActivitySection range={range} />
      </Suspense>

      <Suspense fallback={<ThreeCardRowSkeleton />}>
        <WarmSection range={range} />
      </Suspense>
    </div>
  );
}

async function HeroSection({ range }: { range: DateRange }) {
  const [stats, funnel, series] = await Promise.all([
    getOverviewStats(range),
    getQuizFunnel(range),
    getDailyMetricSeries(range),
  ]);

  const convRate =
    stats.uniqueSessions > 0
      ? `${((stats.leads / stats.uniqueSessions) * 100).toFixed(1)}%`
      : '—';

  const funnelSteps = [
    { label: 'Sessions', value: stats.uniqueSessions },
    { label: 'Quiz starts', value: funnel.starts },
    { label: 'Quiz completes', value: funnel.completes },
    { label: 'Leads', value: stats.leads },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-ma-6">
      <div className="lg:col-span-3">
        <ConversionFunnel title="Conversion funnel" steps={funnelSteps} />
      </div>
      <div className="lg:col-span-2 grid grid-cols-2 gap-ma-4">
        <StatCard
          label="Sessions"
          value={stats.uniqueSessions}
          trend={series.sessions}
        />
        <StatCard label="Leads" value={stats.leads} />
        <StatCard
          label="Quiz completes"
          value={stats.quizCompletions}
          trend={series.quizCompletes}
        />
        <StatCard label="Conv. rate" value={convRate} sub="leads ÷ sessions" />
      </div>
    </div>
  );
}

async function ActivitySection({ range }: { range: DateRange }) {
  const [trend, byType] = await Promise.all([
    getDailyEventTrend(range),
    getEventsByTypeBreakdown(range),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-ma-6">
      <div className="lg:col-span-2">
        <InsightCard
          overline="Activity"
          title="Events per day"
          href="/admin/insights"
          hrefLabel="All insights →"
        >
          <EventTrendChart data={trend} />
        </InsightCard>
      </div>
      <InsightCard overline="Distribution" title="Event mix">
        <DonutChart data={byType.map((r) => ({ name: r.eventType, value: r.total }))} />
      </InsightCard>
    </div>
  );
}

async function WarmSection({ range }: { range: DateRange }) {
  const [topArticles, topAreas, recentLeads] = await Promise.all([
    getTopArticles(range, 5),
    getAreaInterest(range, 5),
    getRecentLeads(5),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-ma-6">
      <InsightCard
        overline="Fresh signal"
        title="Recent leads"
        href="/admin/leads"
        hrefLabel="All →"
      >
        {recentLeads.length === 0 ? (
          <p className="text-sm text-stone">No leads in the last 90 days.</p>
        ) : (
          <ul className="space-y-ma-3 text-sm">
            {recentLeads.map((lead) => (
              <li
                key={lead.id}
                className="flex items-center gap-ma-3 min-w-0 overflow-hidden"
              >
                <Avatar name={lead.customerName ?? lead.customerEmail ?? '—'} />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="text-sumi truncate">
                    {lead.customerName ?? lead.customerEmail ?? '—'}
                  </div>
                  <div className="text-stone text-xs truncate">
                    {lead.prefectureSlug} / {lead.areaSlug}
                  </div>
                </div>
                <span className="text-stone font-mono text-[11px] whitespace-nowrap flex-shrink-0">
                  {toIsoDate(new Date(lead.createdAt)).slice(5)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </InsightCard>

      <InsightCard
        overline="Demand"
        title="Top areas"
        href="/admin/insights"
        hrefLabel="All →"
      >
        <HorizontalBarList
          emptyMessage="No area activity yet."
          items={topAreas.map((a) => ({
            key: a.areaSlug + (a.prefectureSlug ?? ''),
            label: a.areaSlug,
            sub: a.prefectureSlug ?? undefined,
            value: a.leadCount * 3 + a.saveCount,
            href: a.prefectureSlug
              ? `/areas/${a.prefectureSlug}/${a.areaSlug}`
              : undefined,
          }))}
        />
      </InsightCard>

      <InsightCard
        overline="Reading"
        title="Top articles"
        href="/admin/insights"
        hrefLabel="All →"
      >
        <HorizontalBarList
          emptyMessage="No article reads yet."
          items={topArticles.map((a) => ({
            key: a.slug,
            label: a.title || a.slug,
            sub: a.slug,
            value: a.reads,
            href: `/content/${a.slug}`,
          }))}
        />
      </InsightCard>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
  return (
    <div
      aria-hidden
      className="w-8 h-8 rounded-full bg-ai/10 text-ai flex items-center justify-center text-xs font-semibold flex-shrink-0"
    >
      {initials || '?'}
    </div>
  );
}

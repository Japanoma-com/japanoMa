import { Suspense } from 'react';
import {
  getAreaDemandTrend,
  getAreaInterest,
  getLeadProfileAggregates,
  getOverviewStats,
  getPrefectureDemand,
  type DateRange,
  type ProfileAggregate,
} from '@/lib/admin/queries';
import { parseRangeOrDefault } from '@/lib/admin/range';
import { AdminSection } from '@/components/admin/admin-section';
import { InsightCard } from '@/components/admin/insight-card';
import { DonutChart } from '@/components/admin/donut-chart';
import { HorizontalBarList } from '@/components/admin/horizontal-bar-list';
import { StackedAreaChart } from '@/components/admin/stacked-area-chart';
import {
  CardSkeleton,
  ThreeCardRowSkeleton,
} from '@/components/admin/skeletons';

export const metadata = {
  title: 'Area demand · Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

/**
 * Streaming: each section fetches its own data behind its own Suspense.
 * The hero prefecture row almost always comes in first since it only
 * hits the leads table.
 */
export default async function AdminInsightsPage({ searchParams }: Props) {
  const params = await searchParams;
  const range = parseRangeOrDefault(params, 90);

  return (
    <div className="space-y-ma-12">
      <AdminSection
        overline="Area demand"
        title="Where buyers are looking."
        subtitle="Prefecture pulse, area ranking, buyer profile."
        range={range}
      />

      <Suspense fallback={<ThreeCardRowSkeleton />}>
        <PrefectureHeroRow range={range} />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-ma-6">
            <div className="lg:col-span-2">
              <CardSkeleton />
            </div>
            <div className="lg:col-span-3">
              <CardSkeleton />
            </div>
          </div>
        }
      >
        <RankingRow range={range} />
      </Suspense>

      <Suspense fallback={<ThreeCardRowSkeleton />}>
        <BuyerProfileRow range={range} />
      </Suspense>

      <Suspense fallback={<CardSkeleton className="h-48" />}>
        <PrefectureLongTail range={range} />
      </Suspense>
    </div>
  );
}

async function PrefectureHeroRow({ range }: { range: DateRange }) {
  const [prefectures, overview] = await Promise.all([
    getPrefectureDemand(range),
    getOverviewStats(range),
  ]);

  const top = prefectures.slice(0, 3);
  const totalLeads = overview.leads;

  if (top.length === 0) {
    return (
      <div className="bg-shoji border border-border rounded-lg p-ma-8 text-center">
        <p className="text-sm text-stone">No lead activity in this range yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-ma-4">
      {top.map((p, i) => (
        <PrefectureHeroCard
          key={p.prefectureSlug}
          rank={i + 1}
          prefecture={p.prefectureSlug}
          leadCount={p.leadCount}
          saveCount={p.saveCount}
          areaCount={p.areaCount}
          totalLeads={totalLeads}
        />
      ))}
    </div>
  );
}

async function RankingRow({ range }: { range: DateRange }) {
  const [topAreas, trend] = await Promise.all([
    getAreaInterest(range, 15),
    getAreaDemandTrend(range, 5),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-ma-6">
      <div className="lg:col-span-2">
        <InsightCard overline="Ranked" title="Top areas">
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
          <p className="text-xs text-stone mt-ma-4">
            Score = leads × 3 + saves.
          </p>
        </InsightCard>
      </div>

      <div className="lg:col-span-3">
        <InsightCard overline="Momentum" title="Demand trend — top 5 areas">
          <StackedAreaChart data={trend.data} series={trend.series} />
          <p className="text-xs text-stone mt-ma-4">
            Daily lead count for the five areas with the most interest
            across the range. Stacked — the height at any day is total leads
            across these five.
          </p>
        </InsightCard>
      </div>
    </div>
  );
}

async function BuyerProfileRow({ range }: { range: DateRange }) {
  const [profile, overview] = await Promise.all([
    getLeadProfileAggregates(range),
    getOverviewStats(range),
  ]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-ma-4">
        <div>
          <p className="label-overline text-ai mb-ma-1">Who&apos;s asking</p>
          <h2 className="text-2xl font-editorial text-sumi">Buyer profile</h2>
        </div>
        <p className="text-xs text-stone">
          From {profile.totalLeads} leads.
          {overview.saves > 0 && ` ${overview.saves} saves unaccounted.`}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-ma-6">
        <ProfileDimensionCard
          overline="Budget"
          title="Price bracket"
          items={profile.budget}
          emptyMessage="No budget captured yet."
        />
        <ProfileDimensionCard
          overline="Property"
          title="Type interest"
          items={profile.propertyTypes}
          emptyMessage="No property types captured."
        />
        <ProfileDimensionCard
          overline="Use case"
          title="What for"
          items={profile.useCases}
          emptyMessage="No use cases captured."
        />
      </div>
    </div>
  );
}

async function PrefectureLongTail({ range }: { range: DateRange }) {
  const prefectures = await getPrefectureDemand(range);

  if (prefectures.length <= 3) return null;

  return (
    <InsightCard
      overline="Everywhere else"
      title="All prefectures with signal"
    >
      <HorizontalBarList
        emptyMessage="No prefecture activity."
        items={prefectures.map((p) => ({
          key: p.prefectureSlug,
          label: p.prefectureSlug,
          sub: `${p.areaCount} area${p.areaCount === 1 ? '' : 's'} · ${p.saveCount} saves`,
          value: p.leadCount,
        }))}
        formatValue={(v) => `${v} lead${v === 1 ? '' : 's'}`}
      />
    </InsightCard>
  );
}

function PrefectureHeroCard({
  rank,
  prefecture,
  leadCount,
  saveCount,
  areaCount,
  totalLeads,
}: {
  rank: number;
  prefecture: string;
  leadCount: number;
  saveCount: number;
  areaCount: number;
  totalLeads: number;
}) {
  const share = totalLeads > 0 ? (leadCount / totalLeads) * 100 : 0;
  const accent = ['#3D5A7A', '#4A6B52', '#A67B3D'][rank - 1] ?? '#3D5A7A';

  return (
    <div className="relative bg-shoji border border-border rounded-lg p-ma-6 overflow-hidden">
      <div
        className="absolute top-0 left-0 h-1"
        style={{ width: `${Math.max(share, 4)}%`, background: accent }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-ma-3 mb-ma-4">
        <div>
          <p className="label-overline text-stone mb-ma-1">#{rank} prefecture</p>
          <h3 className="text-2xl font-editorial text-sumi capitalize">
            {prefecture.replace(/[-_]/g, ' ')}
          </h3>
        </div>
        <div className="text-right">
          <p className="label-overline text-stone mb-ma-1">Share</p>
          <p className="text-lg font-editorial text-sumi tabular-nums">
            {share.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-ma-3 text-center">
        <Metric label="Leads" value={leadCount} accent={accent} highlight />
        <Metric label="Saves" value={saveCount} />
        <Metric label="Areas" value={areaCount} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: number;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="label-overline text-stone mb-ma-1">{label}</p>
      <p
        className="text-2xl font-editorial tabular-nums leading-none"
        style={highlight && accent ? { color: accent } : { color: '#1A1816' }}
      >
        {value}
      </p>
    </div>
  );
}

function ProfileDimensionCard({
  overline,
  title,
  items,
  emptyMessage,
}: {
  overline: string;
  title: string;
  items: ProfileAggregate[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <InsightCard overline={overline} title={title}>
        <p className="text-sm text-stone">{emptyMessage}</p>
      </InsightCard>
    );
  }

  const donutData = items
    .slice(0, 6)
    .map((i) => ({ name: i.value, value: i.count }));

  return (
    <InsightCard overline={overline} title={title}>
      <DonutChart data={donutData} />
      {items.length > 6 && (
        <p className="text-xs text-stone mt-ma-2">
          Top 6 shown · {items.length - 6} more categorised.
        </p>
      )}
    </InsightCard>
  );
}

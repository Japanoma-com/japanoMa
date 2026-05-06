import { db } from '@/lib/db';
import { cities, prefectures } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { MaDivider, ScrollReveal } from '@/components/japandi';
import { ButtonLink } from '@/components/ui/button-link';
import { createClient } from '@/lib/supabase/server';
import { captureSignalSafe } from '@/lib/journey/capture-safe';
import { NavMapInline } from '@/components/journey/nav-map-inline';
import { getJourneyState, ANONYMOUS_INITIAL_STATE } from '@/lib/journey/queries';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ cities?: string }>;
};

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const slugs = (params.cities || '').split(',').filter(Boolean).slice(0, 3);

  // Resolve journey state once (also covers the captureSignal user lookup)
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const journeyState = user
    ? await getJourneyState(user.id)
    : ANONYMOUS_INITIAL_STATE;

  // D2L journey: viewing the comparison advances to phase 4_shortlist
  if (slugs.length >= 2) {
    await captureSignalSafe(user?.id, 'comparison_viewed', { cityCount: slugs.length });
  }

  if (slugs.length < 2) {
    return (
      <div className="ma-page px-ma-6 py-ma-24">
        <div className="ma-content mx-auto">
          <NavMapInline state={journeyState} />
          <div className="text-center mt-ma-12">
            <p className="font-editorial text-6xl text-sumi/[0.06] mb-ma-6" aria-hidden="true">比</p>
            <h1 className="mb-ma-4">Compare Areas</h1>
            <p className="text-stone mb-ma-8">Add at least 2 areas to compare.</p>
            <ButtonLink href="/areas" variant="outline">Browse areas</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const areaData = await db
    .select({
      slug: cities.slug,
      name: cities.nameEn,
      nameJa: cities.nameJa,
      regionType: cities.regionType,
      closestAirport: cities.closestAirport,
      airportTimeMin: cities.airportTimeMin,
      closestStation: cities.closestStation,
      stationTimeMin: cities.stationTimeMin,
      shuttleBus: cities.shuttleBus,
      carToSlopeMin: cities.carToSlopeMin,
      busToSlopeMin: cities.busToSlopeMin,
      notes: cities.notes,
      prefectureName: prefectures.nameEn,
    })
    .from(cities)
    .innerJoin(prefectures, eq(cities.prefectureId, prefectures.id))
    .where(inArray(cities.slug, slugs));

  const sorted = slugs.map((s) => areaData.find((a) => a.slug === s)).filter(Boolean);

  const rows = [
    { label: 'Prefecture', key: 'prefectureName' },
    { label: 'Region Type', key: 'regionType', format: (v: string | null) => v?.replace(/_/g, ' ') || '' },
    { label: 'Closest Airport', key: 'closestAirport' },
    { label: 'Airport Time', key: 'airportTimeMin', format: (v: number | null) => v ? `${v} min` : '' },
    { label: 'Closest Station', key: 'closestStation' },
    { label: 'Station Time', key: 'stationTimeMin', format: (v: number | null) => v ? `${v} min` : '' },
    { label: 'Shuttle Bus', key: 'shuttleBus', format: (v: boolean | null) => v ? 'Yes' : 'No' },
    { label: 'Car to Slope', key: 'carToSlopeMin', format: (v: number | null) => v ? `${v} min` : '' },
  ] as const;

  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="max-w-[960px] mx-auto">
        <NavMapInline state={journeyState} />
        <ScrollReveal>
          <p className="label-overline text-stone mb-ma-4">Side by side</p>
          <h1 className="mb-ma-12">Compare Areas</h1>
        </ScrollReveal>

        {/* Responsive: horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-ma-6 px-ma-6">
          <div className="grid gap-ma-4 min-w-[600px]" style={{ gridTemplateColumns: `140px repeat(${sorted.length}, 1fr)` }}>
            <div />
            {sorted.map((area) => (
              <ScrollReveal key={area!.slug}>
                <div className="text-center">
                  <p className="font-editorial text-lg text-sumi">{area!.name}</p>
                  <p className="text-xs text-ash">{area!.nameJa}</p>
                </div>
              </ScrollReveal>
            ))}

            {rows.map((row) => {
              const values = sorted.map((area) => {
                const raw = (area as Record<string, unknown>)[row.key];
                return 'format' in row && row.format ? (row.format as (v: unknown) => string)(raw) : String(raw || '');
              });
              const allSame = values.every((v) => v === values[0]);

              return [
                <div key={`label-${row.key}`} className="py-ma-3 border-t border-border">
                  <p className="label-overline text-stone text-[9px]">{row.label}</p>
                </div>,
                ...sorted.map((area, i) => (
                  <div
                    key={`${area!.slug}-${row.key}`}
                    className={`py-ma-3 border-t border-border text-center ${
                      !allSame && values[i] ? 'bg-ai/[0.04] rounded' : ''
                    }`}
                  >
                    <p className="text-sm text-sumi">{values[i] || <span className="text-ash">n/a</span>}</p>
                  </div>
                )),
              ];
            })}
          </div>
        </div>

        <MaDivider size="zone" />

        <ScrollReveal>
          <div className="text-center">
            <ButtonLink href="/areas" variant="outline" size="sm">Browse more areas</ButtonLink>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

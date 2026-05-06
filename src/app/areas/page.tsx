import { getAreasDirectory } from '@/lib/db/queries';
import { MaDivider, ScrollReveal } from '@/components/japandi';
import { breadcrumbJsonLd } from '@/lib/seo/json-ld';
import { getOrigin } from '@/lib/format/origin-actions';
import { AreasDirectory } from './areas-directory';

export const metadata = {
  title: 'Areas',
  description:
    'Every area we cover across Northern Japan snow country. Search by city or prefecture.',
  alternates: { canonical: '/areas' },
};

export const dynamic = 'force-dynamic';

export default async function AreasPage() {
  const [cities, origin] = await Promise.all([
    getAreasDirectory(),
    getOrigin(),
  ]);

  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', href: '/' },
              { name: 'Areas', href: '/areas' },
            ])
          ),
        }}
      />
      <div className="ma-content mx-auto">
        <ScrollReveal>
          <p className="label-overline text-stone mb-ma-4">
            Northern Japan snow country
          </p>
          <h1 className="mb-ma-6">Find your area.</h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-sumi-light leading-body max-w-2xl">
            {cities.length} areas across{' '}
            {new Set(cities.map((c) => c.prefectureSlug)).size}{' '}
            prefectures. Lifestyle-first, non-metro by design. Search or filter
            by prefecture to narrow in.
          </p>
        </ScrollReveal>

        <MaDivider size="breath" line />
      </div>

      {/*
        AreasDirectory is rendered OUTSIDE the 680px content rail so the
        Map view can use the full ma-page width (1120px). The directory
        itself re-applies the narrower rail to the controls + List view
        — only the map breaks out. This is an intentional exception to
        Ma Space's single-rail rule because the editorial 680px column
        was making the 3D silhouette unreadable (Hokkaidō getting cut).
      */}
      <AreasDirectory cities={cities} origin={origin} />
    </div>
  );
}

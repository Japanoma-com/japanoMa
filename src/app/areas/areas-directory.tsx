'use client';

import { useEffect, useMemo, useState, useDeferredValue } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatPriceFromJpy } from '@/lib/format/price';
import {
  AuOrigin,
  formatFlightTime as fmtFlightTime,
  originLabel,
  pickTimeForOrigin,
} from '@/lib/format/origin';
import { OriginPicker } from '@/components/japandi/origin-picker';
import { InfoTip } from '@/components/japandi/info-tip';
import { blurFor } from '@/data/area-blurs';

// 3D Japan silhouette — ~290 KB gzip (three + R3F + drei + scene)
// plus a 498 KB GeoJSON. Lazy-loaded so the default List view stays
// fast and SEO-crawlable.
const Japan3DMap = dynamic(
  () =>
    import('@/components/japandi/japan-3d-map').then((m) => ({
      default: m.Japan3DMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-xl border border-border bg-gradient-to-b from-[#F0EEE6] to-[#D9DEE6] flex items-center justify-center"
        style={{ height: 'min(78vh, 720px)' }}
      >
        <p className="text-sm text-stone">Loading Japan…</p>
      </div>
    ),
  }
);

export type DirectoryCity = {
  citySlug: string;
  cityName: string;
  cityNameJa: string | null;
  regionType: string | null;
  prefectureSlug: string;
  prefectureName: string;
  prefectureNameJa: string | null;
  avgPropertyPriceJpy: number | null;
  offSeasonActivitiesScore: number | null;
  timeFromSydney: string | null;
  timeFromMelbourne: string | null;
  timeFromBrisbane: string | null;
  timeFromPerth: string | null;
  timeFromAdelaide: string | null;
  closestAirport: string | null;
  notes: string | null;
  heroImagePath?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
};

type ViewMode = 'list' | 'map';

/**
 * Areas directory for Australian buyers. Phase labels internal only.
 *
 * Each card optimises for AU-buyer decision-making:
 *   1. Sense of place — 16:9 hero image when heroImagePath is set,
 *      otherwise a branded gradient + horizon-line placeholder.
 *   2. AUD price headline — the first thing a buyer asks.
 *   3. Flight time from Sydney — accessibility signal.
 *   4. Character pullout from notes — "is this me".
 *   5. Whole-card link with hover indigo shift + subtle lift.
 */
export function AreasDirectory({
  cities,
  origin: initialOrigin,
}: {
  cities: DirectoryCity[];
  origin: AuOrigin;
}) {
  // Hold origin in client state so picker changes are instant — no
  // route refresh, no DB re-fetch. The server already passed the
  // cookie-persisted value as `initialOrigin`; subsequent picks update
  // here and the cookie write happens in a background transition.
  const [origin, setOrigin] = useState<AuOrigin>(initialOrigin);
  const [query, setQuery] = useState('');
  const [prefecture, setPrefecture] = useState<string | null>(null);
  // SSR-safe default = list (also the mobile-first / crawler-friendly
  // choice). On client mount, if the viewport is ≥lg (1024px) we
  // promote the default to map so desktop visitors land on the
  // 3D silhouette as the brand's first impression. Runs once — any
  // subsequent toggle action wins so we don't fight the user.
  const [view, setView] = useState<ViewMode>('list');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setView('map');
    }
  }, []);

  const deferredQuery = useDeferredValue(query);

  const prefectures = useMemo(() => {
    const seen = new Set<string>();
    const list: { slug: string; name: string }[] = [];
    for (const c of cities) {
      if (seen.has(c.prefectureSlug)) continue;
      seen.add(c.prefectureSlug);
      list.push({ slug: c.prefectureSlug, name: c.prefectureName });
    }
    return list;
  }, [cities]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return cities.filter((c) => {
      if (prefecture && c.prefectureSlug !== prefecture) return false;
      if (!q) return true;
      const haystack = [
        c.cityName,
        c.cityNameJa,
        c.prefectureName,
        c.prefectureNameJa,
        c.regionType,
        c.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [cities, deferredQuery, prefecture]);

  const activeFilters = (prefecture ? 1 : 0) + (query ? 1 : 0);

  // The controls + List view stay in the narrow editorial rail (680px)
  // for typographic consistency with the rest of the site. The Map
  // view escapes to the wider ma-page rail (1120px) so the 3D Japan
  // silhouette + always-on info panel fit comfortably side-by-side.
  // This is an intentional Ma Space exception — see comment in
  // src/app/areas/page.tsx.
  return (
    <div className="space-y-ma-8">
      <div className="ma-content mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-ma-4">
          <div>
            <OriginPicker value={origin} onChange={setOrigin} />
            <p className="text-[11px] text-stone mt-ma-2">
              Travel times update across every area card.
            </p>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {view === 'list' && (
        <div className="ma-content mx-auto space-y-ma-8">
          <div className="relative">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, prefecture, ski resort, onsen…"
              aria-label="Search areas"
              className="w-full bg-kinu border border-border rounded-lg pl-14 pr-ma-4 py-ma-4 text-base text-sumi placeholder:text-stone/70 focus:border-ai focus:outline-none transition-colors duration-base ease-settle"
            />
          </div>

          {prefectures.length > 1 && (
            <div className="flex items-baseline gap-ma-3 flex-wrap">
              <span className="label-overline text-stone flex-shrink-0">
                Prefecture
              </span>
              <div className="flex gap-ma-2 flex-wrap">
                <Chip
                  active={prefecture === null}
                  onClick={() => setPrefecture(null)}
                  label="All"
                />
                {prefectures.map((p) => (
                  <Chip
                    key={p.slug}
                    active={prefecture === p.slug}
                    onClick={() =>
                      setPrefecture(prefecture === p.slug ? null : p.slug)
                    }
                    label={p.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-baseline justify-between text-sm text-stone">
            <p>
              {filtered.length} {filtered.length === 1 ? 'area' : 'areas'}
              {activeFilters > 0 && (
                <>
                  {' '}
                  ·{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setPrefecture(null);
                    }}
                    className="underline underline-offset-2 hover:text-sumi transition-colors duration-base ease-settle"
                  >
                    Clear
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {view === 'map' ? (
        <Japan3DMap cities={cities} origin={origin} />
      ) : filtered.length === 0 ? (
        <div className="ma-content mx-auto">
          <div className="py-ma-24 text-center">
            <p
              style={{
                fontFamily: 'var(--font-editorial)',
                fontWeight: 400,
                color: 'var(--sumi)',
              }}
              className="text-[28px] mb-ma-3 leading-tight"
            >
              Nothing matches.
            </p>
            <p className="text-sm text-stone">
              Try a different keyword or clear the filter.
            </p>
          </div>
        </div>
      ) : (
        <div className="ma-content mx-auto">
          <div className="grid gap-ma-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <AreaCard
                key={`${c.prefectureSlug}-${c.citySlug}`}
                city={c}
                origin={origin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose display: List of cards or interactive Map"
      className="inline-flex rounded-md bg-shoji p-[3px] border border-border"
    >
      <ToggleButton
        active={view === 'list'}
        onClick={() => onChange('list')}
        label="List"
      />
      <ToggleButton
        active={view === 'map'}
        onClick={() => onChange('map')}
        label="Map"
      />
    </div>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={[
        'px-ma-3 h-7 rounded text-[11px] font-medium tracking-wide transition-colors duration-base ease-settle',
        active
          ? 'bg-ai text-kinu shadow-[0_1px_2px_rgba(61,90,122,0.25)]'
          : 'text-sumi-light hover:bg-kinu hover:text-sumi',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

const REGION_LABELS: Record<string, string> = {
  ski_resort: 'Ski resort',
  rural_town: 'Rural town',
  coastal: 'Coastal',
  onsen_town: 'Onsen town',
  urban_access: 'Urban',
  mountain_village: 'Mountain village',
  lakeside: 'Lakeside',
};

function AreaCard({ city, origin }: { city: DirectoryCity; origin: AuOrigin }) {
  const price = city.avgPropertyPriceJpy
    ? formatPriceFromJpy(city.avgPropertyPriceJpy)
    : null;

  const region = city.regionType
    ? REGION_LABELS[city.regionType] ?? toTitleCase(city.regionType.replace(/_/g, ' '))
    : null;

  const flightFromOrigin = pickTimeForOrigin(origin, city);

  const hasAnyStat = Boolean(
    price || flightFromOrigin || city.offSeasonActivitiesScore != null
  );

  const notesPullout = (() => {
    if (!city.notes) return null;
    const clean = city.notes.replace(/\s+/g, ' ').trim();
    if (clean.length > 100) return clean.slice(0, 98).trimEnd() + '…';
    return clean;
  })();

  // Format the full yen value for the AUD-primary tooltip.
  const yenFull = city.avgPropertyPriceJpy
    ? `¥${city.avgPropertyPriceJpy.toLocaleString('en-AU')}`
    : undefined;

  return (
    <Link
      href={`/areas/${city.prefectureSlug}/${city.citySlug}`}
      className="group flex flex-col h-full rounded-xl overflow-hidden bg-kinu transition-all duration-slow ease-settle hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(26,24,22,0.08)]"
      // containerType lets the title font-size react to the *card*
      // width via cqi units, so "Minamiuonuma" autoshrinks on a
      // narrow 3-col grid card and grows on a wider 1-col layout.
      style={{
        boxShadow: '0 1px 3px rgba(26,24,22,0.05)',
        containerType: 'inline-size',
      }}
    >
      {/* Hero — image bleeds to card edges. Tiny base64 blur from
          area-blurs.ts shows immediately while the full AVIF/JPG
          streams; image fades in over 280ms once it arrives. */}
      <div
        className="relative aspect-[16/9] overflow-hidden bg-washi bg-cover bg-center flex-shrink-0"
        style={{
          backgroundImage: city.heroImagePath
            ? `url("${blurFor(city.citySlug) ?? ''}")`
            : undefined,
        }}
      >
        {city.heroImagePath ? (
          <picture>
            <source srcSet={city.heroImagePath} type="image/avif" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={city.heroImagePath.replace(/\.avif$/, '.jpg')}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-slow ease-settle group-hover:scale-[1.04] animate-fade-in"
            />
          </picture>
        ) : (
          <PlaceholderArt slug={city.citySlug} />
        )}
        <span className="absolute top-ma-3 left-ma-3 inline-flex items-center gap-ma-2 text-[10px] uppercase tracking-[0.15em] text-kinu/90 bg-sumi/55 backdrop-blur-sm px-ma-2 py-[3px] rounded">
          <span>{city.prefectureName}</span>
          {region && (
            <>
              <span className="text-kinu/40" aria-hidden>
                ·
              </span>
              <span>{region}</span>
            </>
          )}
        </span>
      </div>

      {/* Body uses a column flex with the notes block flex-1 so the
          stat row anchors to the bottom of every card regardless of
          how many lines the notes occupy. Cards in the same grid row
          all line up cleanly at the stat baseline. */}
      <div className="flex flex-col flex-1 p-ma-6 gap-ma-3">
        {/* Title — single line guaranteed. fontSize scales with the
            CARD width via cqi (container-query-inline) units so it
            shrinks on narrow grid columns and grows on wider layouts.
            8.2cqi means the title takes ~8.2% of the card's inline
            size, capped 18-26px. Long names like "Minamiuonuma" land
            at the smaller end of the range and fit; short names like
            "Iiyama" sit at the bigger end. */}
        <h3
          style={{
            fontFamily: 'var(--font-editorial)',
            fontWeight: 400,
            color: 'var(--sumi)',
            fontSize: 'clamp(18px, 8.2cqi, 26px)',
            lineHeight: 1.2,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            // Reserve room for Shippori Mincho descenders ('y', 'g', 'p', 'q').
            paddingBottom: '0.1em',
          }}
          className="font-editorial group-hover:text-ai transition-colors duration-base ease-settle"
        >
          {city.cityName}
          <span
            aria-hidden
            className="ml-ma-2 text-ash text-[0.65em] group-hover:text-ai transition-colors align-baseline"
          >
            →
          </span>
        </h3>

        {notesPullout ? (
          <p className="text-[13px] text-sumi-light leading-relaxed line-clamp-2 flex-1">
            {notesPullout}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        {/* Stats — one per line. Info icon only on the year-round
            score (the one stat whose meaning isn't self-evident). */}
        {hasAnyStat && (
          <div className="space-y-[3px] pt-ma-1">
            {price && (
              <StatLine
                value={price.primary}
                valueTitle={yenFull}
                label="avg price"
              />
            )}
            {flightFromOrigin && (
              <StatLine
                value={fmtFlightTime(flightFromOrigin)}
                label={`from ${originLabel(origin)}`}
              />
            )}
            {city.offSeasonActivitiesScore != null && (
              <StatLine
                value={`${city.offSeasonActivitiesScore}/10`}
                label="year-round appeal"
                info="Year-round appeal — measures how much a town has to offer beyond winter ski season. Onsens, hiking trails, summer festivals, regional cuisine, cultural sites, scenic drives. Higher scores mean a stronger reason to visit (or own a base) any time of year, not just snow months."
              />
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * StatLine — value-first / label-second editorial row.
 */
function StatLine({
  value,
  valueTitle,
  label,
  info,
}: {
  value: string;
  valueTitle?: string;
  label: string;
  info?: string;
}) {
  return (
    <div className="flex items-baseline gap-ma-2 text-[12px] tabular-nums whitespace-nowrap">
      <span className="font-medium text-sumi" title={valueTitle}>
        {value}
      </span>
      <span className="text-stone/70 inline-flex items-center gap-1">
        {label}
        {info && <InfoTip text={info} />}
      </span>
    </div>
  );
}


/**
 * Gradient + minimal horizon-line placeholder used when a city has no
 * hero image yet. Deterministic per slug so each card has a stable
 * identity, five Japandi palettes so the grid feels varied.
 */
function PlaceholderArt({ slug }: { slug: string }) {
  const palette = PLACEHOLDER_PALETTES[hashToIndex(slug, PLACEHOLDER_PALETTES.length)];
  return (
    <div
      aria-hidden
      className="w-full h-full relative transition-transform duration-slow ease-settle group-hover:scale-[1.03]"
      style={{
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
    >
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[45%] opacity-40"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0,80 L0,52 L50,30 L105,48 L160,22 L215,38 L270,24 L325,40 L400,22 L400,80 Z"
          fill={palette.ink}
        />
      </svg>
    </div>
  );
}

const PLACEHOLDER_PALETTES: Array<{ from: string; to: string; ink: string }> = [
  { from: '#3D5A7A', to: '#6B92B7', ink: '#2C4562' }, // indigo
  { from: '#4A6B52', to: '#8FAE93', ink: '#2F4635' }, // pine
  { from: '#A67B3D', to: '#D4B582', ink: '#6F5027' }, // amber
  { from: '#6A645C', to: '#C4BDB4', ink: '#3D3833' }, // stone
  { from: '#5A7A8A', to: '#A7C1CE', ink: '#3E5461' }, // slate
];

function hashToIndex(slug: string, n: number): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % n;
}

function toTitleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-ma-3 py-ma-1 rounded-sm text-xs font-semibold tracking-wide transition-colors duration-base ease-settle ${
        active
          ? 'bg-ai text-kinu'
          : 'bg-shoji border border-border text-sumi-light hover:border-ai hover:text-ai'
      }`}
    >
      {label}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      className="absolute left-5 top-1/2 -translate-y-1/2 text-stone"
    >
      <circle cx="9.5" cy="9.5" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M14 14L18 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

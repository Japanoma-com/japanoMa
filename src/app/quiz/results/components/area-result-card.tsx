import Link from 'next/link';
import { formatPriceFromJpy } from '@/lib/format/price';
import { blurFor } from '@/data/area-blurs';
import { InfoTip } from '@/components/japandi/info-tip';
import {
  AuOrigin,
  formatFlightTime as fmtFlightTime,
  originLabel,
  pickTimeForOrigin,
} from '@/lib/format/origin';

type Props = {
  variant: 'hero' | 'half';
  topMatchBadge?: boolean;
  cityName: string;
  prefectureName: string;
  citySlug: string;
  prefectureSlug: string;
  score: number;
  explanation: string;
  isAuthenticated: boolean;
  origin: AuOrigin;
  // Editorial card enrichment — kept optional so legacy results in
  // localStorage (saved before the schema extension) still render.
  regionType?: string | null;
  heroImagePath?: string | null;
  avgPropertyPriceJpy?: number | null;
  timeFromSydney?: string | null;
  timeFromMelbourne?: string | null;
  timeFromBrisbane?: string | null;
  timeFromPerth?: string | null;
  timeFromAdelaide?: string | null;
  offSeasonActivitiesScore?: number | null;
};

const REGION_LABELS: Record<string, string> = {
  ski_resort: 'Ski resort',
  rural_town: 'Rural town',
  coastal: 'Coastal',
  onsen_town: 'Onsen town',
  urban_access: 'Urban',
  mountain_village: 'Mountain village',
  lakeside: 'Lakeside',
};

const PLACEHOLDER_PALETTES: Array<{ from: string; to: string; ink: string }> = [
  { from: '#3D5A7A', to: '#6B92B7', ink: '#2C4562' },
  { from: '#4A6B52', to: '#8FAE93', ink: '#2F4635' },
  { from: '#A67B3D', to: '#D4B582', ink: '#6F5027' },
  { from: '#6A645C', to: '#C4BDB4', ink: '#3D3833' },
  { from: '#5A7A8A', to: '#A7C1CE', ink: '#3E5461' },
];

function hashToIndex(slug: string, n: number): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % n;
}

/**
 * Quiz-results area card — visual parity with the /areas directory
 * card (image hero + editorial header + stat row), with quiz-specific
 * additions: match-score percent in the top-right and the dual CTA
 * (Express interest → consent flow, plus a soft "read the area guide"
 * link).
 *
 * Two variants:
 *   hero — top match, full-width, larger title + 21:9 image, badge eligible.
 *   half — sibling matches, grid-cell, 16:9 image.
 *
 * Replaces the older AreaCardFrame-based version (still used by /account).
 */
export function AreaResultCard({
  variant,
  topMatchBadge,
  cityName,
  prefectureName,
  citySlug,
  prefectureSlug,
  score,
  explanation,
  isAuthenticated,
  origin,
  regionType,
  heroImagePath,
  avgPropertyPriceJpy,
  timeFromSydney,
  timeFromMelbourne,
  timeFromBrisbane,
  timeFromPerth,
  timeFromAdelaide,
  offSeasonActivitiesScore,
}: Props) {
  const isHero = variant === 'hero';

  const interestHash = `/account#interest=${citySlug}`;
  const expressHref = isAuthenticated
    ? interestHash
    : `/login?next=${encodeURIComponent(interestHash)}`;
  const areaGuideHref = `/areas/${prefectureSlug}/${citySlug}`;

  const region = regionType
    ? REGION_LABELS[regionType] ?? regionType.replace(/_/g, ' ')
    : null;

  const price = avgPropertyPriceJpy ? formatPriceFromJpy(avgPropertyPriceJpy) : null;
  const flightFromOrigin = pickTimeForOrigin(origin, {
    timeFromSydney,
    timeFromMelbourne,
    timeFromBrisbane,
    timeFromPerth,
    timeFromAdelaide,
  });
  const hasAnyStat = Boolean(
    price || flightFromOrigin || offSeasonActivitiesScore != null
  );

  // Score colour mirrors the previous AreaCardFrame: matsu green ≥80,
  // sumi 60-79, stone <60. Keeps the at-a-glance match strength signal.
  const scoreColor =
    score >= 80 ? 'text-matsu' : score >= 60 ? 'text-sumi' : 'text-stone';

  const yenFull = avgPropertyPriceJpy
    ? `¥${avgPropertyPriceJpy.toLocaleString('en-AU')}`
    : undefined;

  return (
    <article
      className="group flex flex-col overflow-hidden bg-kinu rounded-xl transition-all duration-slow ease-settle hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(26,24,22,0.08)]"
      // containerType lets the city-name font-size react to the
      // card's actual inline size via cqi units. Long names auto-
      // shrink, short names grow — title always sits on one line.
      style={{
        boxShadow: '0 1px 3px rgba(26,24,22,0.05)',
        containerType: 'inline-size',
      }}
    >
      {/* Hero — image bleeds with overlaid match-score badge +
          prefecture/region chips. Base64 blur from area-blurs.ts
          shows while the full image streams. */}
      <div
        className={`relative overflow-hidden bg-washi bg-cover bg-center ${
          isHero ? 'aspect-[21/9]' : 'aspect-[16/9]'
        }`}
        style={{
          backgroundImage: heroImagePath
            ? `url("${blurFor(citySlug) ?? ''}")`
            : undefined,
        }}
      >
        {heroImagePath ? (
          <picture>
            <source srcSet={heroImagePath} type="image/avif" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImagePath.replace(/\.avif$/, '.jpg')}
              alt=""
              loading={isHero ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-slow ease-settle group-hover:scale-[1.04] animate-fade-in"
            />
          </picture>
        ) : (
          <PlaceholderArt slug={citySlug} />
        )}

        {/* Subtle dark gradient at top so chips are legible on bright photos. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-sumi/40 to-transparent pointer-events-none"
        />

        <div className="absolute top-ma-3 left-ma-3 right-ma-3 flex items-start justify-between gap-ma-3">
          <div className="flex flex-col gap-ma-1 items-start">
            {topMatchBadge && isHero ? (
              <span className="badge-appear text-[10px] uppercase tracking-[0.15em] text-kinu bg-ai px-ma-2 py-[3px] rounded font-medium">
                Your top match
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.15em] text-kinu/90 bg-sumi/45 backdrop-blur-sm px-ma-2 py-[3px] rounded">
                {prefectureName}
              </span>
            )}
            {region && !(topMatchBadge && isHero) && (
              <span className="text-[10px] uppercase tracking-[0.15em] text-kinu/85 bg-sumi/45 backdrop-blur-sm px-ma-2 py-[3px] rounded">
                {region}
              </span>
            )}
          </div>
          {/* Score chip — bigger on hero variant, indigo emphasis */}
          <div
            className="bg-kinu/95 backdrop-blur-sm rounded-md px-ma-3 py-ma-1 flex items-baseline gap-[2px] shadow-sm"
            title={`Match score ${score}/100`}
          >
            <span
              style={{
                fontFamily: 'var(--font-editorial)',
                fontWeight: 400,
                color:
                  score >= 80
                    ? 'var(--matsu)'
                    : score >= 60
                      ? 'var(--sumi)'
                      : 'var(--stone)',
              }}
              className={`tabular-nums leading-none ${isHero ? 'text-[28px]' : 'text-[22px]'}`}
            >
              {score}
            </span>
            <span className="text-stone text-[11px] tabular-nums leading-none">
              %
            </span>
          </div>
        </div>

        {topMatchBadge && isHero && (
          <span className="absolute top-ma-3 left-ma-3 mt-[28px] text-[10px] uppercase tracking-[0.15em] text-kinu/90 bg-sumi/45 backdrop-blur-sm px-ma-2 py-[3px] rounded">
            {prefectureName}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-ma-6 space-y-ma-4">
        {/* Title — single line, font-size reacts to card inline-size
            via cqi units so it never wraps. Hero variant scales bigger
            because its card is wider. */}
        <h3
          style={{
            fontFamily: 'var(--font-editorial)',
            fontWeight: 400,
            color: 'var(--sumi)',
            fontSize: isHero
              ? 'clamp(26px, 5cqi, 36px)'
              : 'clamp(18px, 8.2cqi, 26px)',
            lineHeight: 1.2,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            // Reserve room for Shippori Mincho descenders ('y', 'g', 'p').
            // overflow:hidden + tight line-height was visually clipping them.
            paddingBottom: '0.1em',
          }}
          className="font-editorial group-hover:text-ai transition-colors duration-base ease-settle"
        >
          {cityName}
          <span
            aria-hidden
            className="ml-ma-2 text-ash text-[0.6em] group-hover:text-ai transition-colors align-baseline"
          >
            →
          </span>
        </h3>

        {explanation && (
          <p
            className={`text-[13px] text-sumi-light leading-relaxed ${
              isHero ? '' : 'line-clamp-3'
            }`}
          >
            {explanation}
          </p>
        )}

        {/* Stats — one per line. Info icon only on the year-round
            score (the one stat whose meaning isn't self-evident). */}
        {hasAnyStat && (
          <div className="space-y-[3px]">
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
            {offSeasonActivitiesScore != null && (
              <StatLine
                value={`${offSeasonActivitiesScore}/10`}
                label="year-round appeal"
                info="Year-round appeal — measures how much a town has to offer beyond winter ski season. Onsens, hiking trails, summer festivals, regional cuisine, cultural sites, scenic drives. Higher scores mean a stronger reason to visit (or own a base) any time of year, not just snow months."
              />
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="mt-auto pt-ma-2 space-y-ma-2">
          <Link
            href={expressHref}
            className={`inline-flex items-center justify-center bg-ai text-kinu font-semibold tracking-wide rounded-lg hover:bg-ai-deep transition-colors duration-base ease-settle ${
              isHero ? 'w-full h-12 text-sm' : 'w-full h-11 text-sm'
            }`}
          >
            Express interest →
          </Link>
          <Link
            href={areaGuideHref}
            className="inline-block text-[11px] text-stone underline underline-offset-[3px] hover:text-sumi transition-colors duration-base ease-settle"
          >
            Read the area guide →
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * StatLine — value-first / label-second editorial row used across
 * every result card.
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


function PlaceholderArt({ slug }: { slug: string }) {
  const palette =
    PLACEHOLDER_PALETTES[hashToIndex(slug, PLACEHOLDER_PALETTES.length)];
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

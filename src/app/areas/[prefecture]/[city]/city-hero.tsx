/**
 * Full-bleed hero for the city detail page.
 *
 * Renders an image when heroImagePath is set, otherwise a branded
 * gradient placeholder (same palette logic as the directory card so
 * the transition from card → detail feels continuous).
 *
 * Title treatment: large Shippori H1 + prefecture overline + JA name
 * + region type, bottom-left aligned over a dark gradient overlay so
 * text contrast holds regardless of image content.
 */

type Props = {
  cityName: string;
  cityNameJa: string | null;
  prefectureName: string;
  regionType: string | null;
  heroImagePath: string | null | undefined;
  citySlug: string;
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

export function CityHero({
  cityName,
  cityNameJa,
  prefectureName,
  regionType,
  heroImagePath,
  citySlug,
}: Props) {
  const region = regionType
    ? REGION_LABELS[regionType] ?? regionType.replace(/_/g, ' ')
    : null;

  return (
    <div className="relative w-full h-[44vh] min-h-[340px] md:h-[56vh] md:min-h-[440px] overflow-hidden">
      {/* Background — AVIF with JPG fallback for older browsers,
          or gradient placeholder when no image is set. */}
      {heroImagePath ? (
        <picture>
          <source srcSet={heroImagePath} type="image/avif" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImagePath.replace(/\.avif$/, '.jpg')}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
      ) : (
        <HeroPlaceholderArt slug={citySlug} />
      )}

      {/* Gradient overlay — dark at bottom so the title block
          reads regardless of image content */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-sumi/80 via-sumi/30 to-transparent"
        aria-hidden
      />

      {/* Title block, bottom-left */}
      <div className="relative h-full ma-page px-ma-6 flex flex-col justify-end pb-ma-12 md:pb-ma-16">
        <div className="max-w-3xl">
          <p
            className="label-overline mb-ma-4"
            style={{ color: '#F5F0E8' }}
          >
            {prefectureName}
          </p>
          <h1
            className="font-editorial leading-[1.05] mb-ma-3"
            style={{
              color: '#FAFAF7',
              fontSize: 'clamp(40px, 7vw, 72px)',
              letterSpacing: '-0.01em',
            }}
          >
            {cityName}
          </h1>
          <div className="flex items-baseline gap-ma-3 flex-wrap">
            {cityNameJa && (
              <span className="text-lg md:text-xl text-ash">{cityNameJa}</span>
            )}
            {region && (
              <>
                {cityNameJa && <span className="text-ash">·</span>}
                <span className="text-xs uppercase tracking-wider text-ash">
                  {region}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroPlaceholderArt({ slug }: { slug: string }) {
  const palette =
    PLACEHOLDER_PALETTES[hashToIndex(slug, PLACEHOLDER_PALETTES.length)];
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `linear-gradient(155deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
    >
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[50%] opacity-50"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,200 L0,130 L100,70 L220,110 L340,50 L460,95 L580,60 L700,100 L800,55 L800,200 Z"
          fill={palette.ink}
        />
      </svg>
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[35%] opacity-70"
        viewBox="0 0 800 140"
        preserveAspectRatio="none"
      >
        <path
          d="M0,140 L0,100 L120,75 L240,95 L360,60 L480,90 L600,70 L720,85 L800,70 L800,140 Z"
          fill={palette.ink}
        />
      </svg>
    </div>
  );
}

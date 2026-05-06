import type { ReactNode } from 'react';
import { blurFor } from '@/data/area-blurs';

type AreaCardFrameProps = {
  variant: 'hero' | 'half';
  cityName: string;
  prefectureName: string;
  score: number;
  explanation: string;
  topMatchBadge?: boolean;
  borderColor?: 'default' | 'active';
  /** Hero image (AVIF path under /public). When omitted, a Japandi
   *  gradient placeholder renders so cards never feel empty. */
  heroImagePath?: string | null;
  /** Slug used to look up the prerendered base64 blur and to seed the
   *  deterministic placeholder palette so each card has stable identity. */
  citySlug: string;
  /** CTA slot — rendered at the bottom (button, link, or block) */
  children: ReactNode;
  /** Optional id for scroll-targeting from hash-handler */
  id?: string;
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

export function AreaCardFrame({
  variant,
  cityName,
  prefectureName,
  score,
  explanation,
  topMatchBadge = false,
  borderColor = 'default',
  heroImagePath,
  citySlug,
  children,
  id,
}: AreaCardFrameProps) {
  const isHero = variant === 'hero';

  const containerClass = [
    'group bg-kinu rounded-xl overflow-hidden',
    'shadow-card transition-[box-shadow,transform] duration-slow ease-settle',
    borderColor === 'active'
      ? 'ring-1 ring-ai/40'
      : 'hover:shadow-[0_8px_24px_rgba(26,24,22,0.08)] hover:-translate-y-[1px]',
    // flex column so the CTA slot flows at the bottom naturally.
    'flex flex-col',
  ].join(' ');

  const blurDataUrl = blurFor(citySlug);
  const palette =
    PLACEHOLDER_PALETTES[hashToIndex(citySlug, PLACEHOLDER_PALETTES.length)];
  // Hero variant gets a slightly more cinematic crop (16:9). Half cards
  // keep 16:9 too so the grid reads as a coherent set rather than a mix.
  const mediaAspectClass = 'aspect-[16/9]';

  const cityClass = isHero
    ? 'font-editorial font-normal text-[28px] leading-tight text-sumi'
    : 'font-editorial font-normal text-[18px] leading-tight text-sumi';

  /**
   * Score colour — a three-tier scale calibrated to the Ma Space semantic
   * palette. Strong matches (≥80) pick up the matsu pine green, moderate
   * matches (60-79) stay in default sumi, and weaker matches (<60) fade
   * to stone so the user reads "this isn't a top fit" at a glance. The %
   * suffix stays stone on all tiers — it's scale context, not value.
   */
  const scoreColor =
    score >= 80 ? 'text-matsu' : score >= 60 ? 'text-sumi' : 'text-stone';

  const scoreClass = isHero
    ? `text-[36px] tabular-nums ${scoreColor} leading-none`
    : `text-[24px] tabular-nums ${scoreColor} leading-none`;

  // Percent suffix sized proportionally to the score number: 18px on hero
  // (half the 36px score) and 14px on half (~60% of the 24px score).
  // Smaller than the value so the number reads as the headline.
  const suffixClass = isHero
    ? 'text-[18px] text-stone ml-[1px]'
    : 'text-[14px] text-stone ml-[1px]';

  const explanationClass = isHero
    ? 'text-sm text-sumi-light leading-body my-ma-4'
    : 'text-sm text-sumi-light leading-body my-ma-3 line-clamp-2';

  return (
    <div id={id} className={containerClass}>
      {/* Media zone — bleeds to card edges. AVIF with JPG fallback for
          older browsers; deterministic gradient + horizon-line placeholder
          when no image is set. The base64 blur fades behind the full
          image so there is never an empty rectangle while it loads. */}
      <div
        className={`relative ${mediaAspectClass} bg-washi bg-cover bg-center overflow-hidden`}
        style={{
          backgroundImage: heroImagePath && blurDataUrl ? `url("${blurDataUrl}")` : undefined,
        }}
      >
        {heroImagePath ? (
          <picture>
            <source srcSet={heroImagePath} type="image/avif" />
            <img
              src={heroImagePath.replace(/\.avif$/, '.jpg')}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-slow ease-settle group-hover:scale-[1.03] animate-fade-in"
            />
          </picture>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 transition-transform duration-slow ease-settle group-hover:scale-[1.03]"
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
        )}

        {topMatchBadge && isHero && (
          <span className="absolute top-ma-3 left-ma-3 inline-flex items-center text-[9px] font-bold uppercase tracking-[0.15em] text-kinu bg-ai/95 backdrop-blur-sm px-ma-2 py-[4px] rounded-full shadow-[0_1px_3px_rgba(26,24,22,0.18)]">
            Your top match
          </span>
        )}

        {/* Soft bottom gradient on hero image so the prefecture overline
            (placed in the body just below the image) reads with comfort
            even when the photo skews bright. Half cards skip this — the
            shorter card needs every pixel of imagery to register. */}
        {isHero && heroImagePath && (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-sumi/15 to-transparent"
          />
        )}
      </div>

      {/* Body — uniform p-ma-6 (24px) padding. */}
      <div className="flex flex-col flex-1 p-ma-6">
        <div className="flex items-start justify-between gap-ma-4">
          <div>
            <h3 className={cityClass}>{cityName}</h3>
            <p className="mt-1 text-xs text-stone">{prefectureName}</p>
          </div>
          <div className={scoreClass}>
            {score}
            <span className={suffixClass}>%</span>
          </div>
        </div>

        <p className={explanationClass}>{explanation}</p>

        {/*
          CTA slot. mt-auto flows the button to the bottom of the flex column.
          Combined with items-start on the parent grid, cards don't stretch to
          match their sibling's height, so there's no "extra row of whitespace"
          below the button — the slot sizes exactly to its content and the
          card's p-ma-6 padding is the only space below the button.

          pt-ma-3 (12px) is a tight breath above the button. Combined with
          the explanation's my-ma-4 bottom margin, total above-button space
          is ~28px — intentional, not ghosty.
        */}
        <div className="mt-auto pt-ma-3">{children}</div>
      </div>
    </div>
  );
}

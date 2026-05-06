import type { Viewport } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button-link';
import { ScrollReveal } from '@/components/japandi';
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo/json-ld';

// Override the default washi theme-color on the home page so iOS
// Safari tints the dynamic-island area and the bottom URL-bar chrome
// with sumi — matching the dark hero, so the safe areas blend into
// the image instead of showing a cream strip above and below it.
export const viewport: Viewport = {
  themeColor: '#1A1816',
  viewportFit: 'cover',
};

const PILLARS = [
  {
    name: 'Clarity',
    description: 'Plain English, step-by-step, no jargon. Every number explained.',
  },
  {
    name: 'Financial Realism',
    description: 'Full costs, conservative assumptions, FX awareness. No best-case fantasies.',
  },
  {
    name: 'Risk Control',
    description: 'Practical checks for winter access, maintenance, moisture, legal constraints.',
  },
  {
    name: 'Local Execution',
    description: 'Licensed partners and vetted specialists: inspection, renovation, management.',
  },
  {
    name: 'Lifestyle Fit',
    description: 'Skiing rhythm, family needs, year-round usability. Home base suitability first.',
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationJsonLd(), webSiteJsonLd()]),
        }}
      />
      {/* Hero — compact cinematic plate. The image IS the canvas; typography
           sits over it. Uses svh (stable across iOS URL-bar changes), clamp
           heights across phones / tablets / desktop, and a biased focal point
           so the valley reads well in portrait crops. */}
      <section className="hero-viewport relative -mt-16 w-full overflow-hidden bg-sumi">
        <Image
          src="/images/hero-location.jpg"
          alt="A single warmly-lit gassho-zukuri farmhouse in a snow-covered Northern Japan mountain village at blue hour, soft alpenglow on the highest peak, ridges receding into low valley fog beneath a starry indigo sky"
          fill
          priority
          quality={92}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAEAAcDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAcEAACAgIDAAAAAAAAAAAAAAAAAwERAgQFEyL/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABURAQEAAAAAAAAAAAAAAAAAAAAR/9oADAMBAAIRAxEAPwCRqvcrj8el2aqmvE0ACsB//9k="
          className="object-cover animate-ken-burns"
          style={{
            // 55% horizontal favours the warm-glow farmhouse on the
            // right-of-centre; 62% vertical keeps the village + tree
            // silhouette in frame on portrait crops without losing
            // the alpenglow peak above.
            objectPosition: '55% 62%',
            // Lighter post-filter than before — the source already
            // has the right tonality after the sharpen + contrast pass.
            filter: 'saturate(0.96) brightness(0.99)',
          }}
        />

        {/* Dual gradient — bottom-weighted scrim for legibility,
            plus a left pocket to carry the type without darkening the sky. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to top, rgba(26,24,22,0.86) 0%, rgba(26,24,22,0.5) 34%, rgba(26,24,22,0.1) 66%, transparent 100%),
              linear-gradient(to right, rgba(26,24,22,0.6) 0%, rgba(26,24,22,0.2) 44%, transparent 72%)
            `,
          }}
        />

        {/* Top masthead — Vol. / Plate. Sits below the fixed nav.
            Hidden on the shortest viewports (landscape phones) so the
            hero never feels stacked. */}
        <div
          className="animate-fade-up hidden min-[380px]:flex absolute top-0 left-0 right-0 px-ma-6 sm:px-ma-12 lg:px-ma-16 pt-[78px] sm:pt-[96px] items-center justify-between gap-ma-4"
          style={{ '--fade-delay': '0ms' } as React.CSSProperties}
        >
          <div className="flex items-baseline gap-ma-2 sm:gap-ma-3">
            <span className="font-editorial italic text-kinu/80 text-[13px] sm:text-base">
              Vol. I
            </span>
            <span aria-hidden className="block w-5 sm:w-6 h-px bg-kinu/30" />
            <span className="font-ui text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.25em] uppercase text-kinu/65 tabular-nums">
              MMXXVI
            </span>
          </div>
          <span className="font-ui text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.25em] uppercase text-kinu/65 tabular-nums">
            Plate 01
          </span>
        </div>

        {/* Main content pocket — bottom-left anchored. Respects the iPhone
            home-indicator via env(safe-area-inset-bottom). */}
        <div
          className="hero-pocket absolute inset-x-0 bottom-0 px-ma-6 sm:px-ma-12 lg:px-ma-16"
          style={{
            paddingBottom:
              'calc(var(--pocket-pb, 40px) + env(safe-area-inset-bottom))',
          }}
        >
          <div className="max-w-[960px]">

            {/* Chapter mark */}
            <div
              className="animate-fade-up flex items-center gap-ma-3 sm:gap-ma-4 mb-ma-4 sm:mb-ma-6"
              style={{ '--fade-delay': '120ms' } as React.CSSProperties}
            >
              <span className="font-ui text-[9px] sm:text-[10px] tracking-[0.28em] sm:tracking-[0.3em] uppercase text-kinu/70 tabular-nums shrink-0">
                Ch · 01
              </span>
              <span aria-hidden className="h-px w-10 sm:w-24 bg-kinu/35" />
              <span className="font-ui text-[9px] sm:text-[10px] tracking-[0.28em] sm:tracking-[0.3em] uppercase text-kinu/70 shrink-0">
                Location first
              </span>
            </div>

            {/* Brand kicker — the emotional supertitle above the dossier
                thesis. Italic Shippori Mincho, sized between the chapter
                mark (10px) and the headline (36–92px) so the eye steps
                up into the big moment. */}
            <p
              className="animate-fade-up font-editorial italic text-kinu/90 leading-[1.35] mb-ma-4 sm:mb-ma-6 max-w-[640px]"
              style={{
                fontSize: 'clamp(1.125rem, 1.1vw + 0.75rem, 1.75rem)',
                '--fade-delay': '200ms',
                textShadow: '0 1px 16px rgba(26,24,22,0.35)',
              } as React.CSSProperties}
            >
              From loving Japan to living in Japan &mdash;
            </p>

            {/* Headline — the signature moment. Single word, massive
                Shippori Mincho with a trailing hair-thin rule that
                extends from the period to the right edge so the word
                carries the horizontal weight the triple-repeat used
                to carry. Clamp pushed slightly (64–128px) since one
                line has the room to be more emphatic. */}
            <h1
              className="animate-fade-up font-editorial font-normal tracking-[-0.02em] leading-[0.9] flex items-baseline gap-ma-4 sm:gap-ma-6"
              style={{
                fontSize: 'clamp(3rem, 8vw + 0.5rem, 8rem)',
                color: '#FFFFFF',
                '--fade-delay': '280ms',
                textShadow: '0 2px 24px rgba(26,24,22,0.4)',
              } as React.CSSProperties}
            >
              <span>Location.</span>
              <span
                aria-hidden
                className="flex-1 h-px bg-kinu/40 mb-[0.3em]"
              />
            </h1>

            {/* Subhead */}
            <p
              className="animate-fade-up mt-ma-4 sm:mt-ma-6 lg:mt-ma-8 font-editorial italic text-kinu/85 leading-[1.5] max-w-[540px]"
              style={{
                fontSize: 'clamp(1rem, 0.5vw + 0.875rem, 1.3125rem)',
                '--fade-delay': '360ms',
              } as React.CSSProperties}
            >
              The one thing you can&rsquo;t change or renovate.
            </p>

            {/* Metadata strip — ASCII-only. Coordinates, altitude, corridor.
                Wraps gracefully on narrow screens. */}
            <div
              className="animate-fade-up mt-ma-6 sm:mt-ma-8 lg:mt-ma-12 flex flex-wrap items-center gap-x-ma-3 sm:gap-x-ma-4 gap-y-ma-2 font-ui text-[9px] sm:text-[10px] tracking-[0.26em] sm:tracking-[0.28em] uppercase text-kinu/65 tabular-nums"
              style={{ '--fade-delay': '480ms' } as React.CSSProperties}
            >
              <span>N 36°43′</span>
              <span aria-hidden className="text-kinu/30">·</span>
              <span>E 138°30′</span>
              <span aria-hidden className="text-kinu/30">·</span>
              <span>Alt 1,800m</span>
              <span aria-hidden className="text-kinu/30">·</span>
              <span>Nagano Highlands</span>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 02 — On what you can't renovate.
          The argument made visually: the "can change" list sits
          struck through (the lesser truths), a "But" hinge with
          flanking rules marks the pivot, then the permanent truths
          land as display type, and the bigger question gets its
          own breath with a rule-and-dot ornament. Motion staggers
          the can-change items one-by-one so the strikes arrive
          in sequence before the pivot.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32 overflow-hidden">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch &middot; 02
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                On what you can&rsquo;t renovate
              </span>
            </div>
          </ScrollReveal>

          {/* The lesser truths — what renovation can fix. Struck through
              so the visual tells you before the prose: these aren't
              the point. Staggered reveals land each strike in turn. */}
          <ol className="space-y-ma-3 mb-ma-12 sm:mb-ma-16">
            {['change the kitchen.', 'fix the bathroom.', 'repaint the walls.'].map((text, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <li className="flex items-baseline gap-ma-4">
                  <span className="font-ui text-[10px] tracking-[0.25em] uppercase text-ash tabular-nums w-6 shrink-0">
                    0{i + 1}
                  </span>
                  <span className="font-editorial italic text-stone text-lg sm:text-xl leading-[1.55] line-through decoration-sumi/25 decoration-[1px] underline-offset-[6px]">
                    You can {text}
                  </span>
                </li>
              </ScrollReveal>
            ))}
          </ol>

          {/* "But" hinge — the editorial pivot. Rules on either side
              give the word the weight of a page turn. */}
          <ScrollReveal delay={120}>
            <div className="flex items-center gap-ma-4 sm:gap-ma-6 mb-ma-12 sm:mb-ma-16">
              <span aria-hidden className="flex-1 h-px bg-sumi/30" />
              <span
                className="font-editorial italic text-sumi tracking-[-0.01em]"
                style={{ fontSize: 'clamp(1.5rem, 2vw + 0.5rem, 2.5rem)' }}
              >
                But
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/30" />
            </div>
          </ScrollReveal>

          {/* The permanent truths — display type, paired stagger.
              Lower-case to mirror the chapter's quiet insistence. */}
          <div className="flex flex-col gap-ma-6 mb-ma-16 sm:mb-ma-24">
            <ScrollReveal>
              <p
                className="font-editorial text-sumi tracking-[-0.01em] leading-[1.1]"
                style={{ fontSize: 'clamp(1.875rem, 3vw + 0.75rem, 3.25rem)' }}
              >
                you can&rsquo;t move the house.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={180}>
              <p
                className="font-editorial text-sumi tracking-[-0.01em] leading-[1.15]"
                style={{ fontSize: 'clamp(1.875rem, 3vw + 0.75rem, 3.25rem)' }}
              >
                you can&rsquo;t get closer to the nearest airport or bullet
                train station.
              </p>
            </ScrollReveal>
          </div>

          {/* Setup — italic aside, quiet prelude to the big moment. */}
          <ScrollReveal>
            <p
              className="font-editorial italic text-stone leading-[1.65] max-w-[560px] mb-ma-12 sm:mb-ma-16"
              style={{ fontSize: 'clamp(1.0625rem, 0.5vw + 0.875rem, 1.25rem)' }}
            >
              Before falling in love with the floor plan or the bargain price,
              ask the bigger question:
            </p>
          </ScrollReveal>

          {/* The bigger question — maximum display moment. Kicker above,
              massive Shippori Mincho body, rule-dot-rule ornament below
              as a visual period. More breath than any other block in
              the chapter. */}
          <ScrollReveal delay={140}>
            <figure className="mb-ma-16 sm:mb-ma-24">
              <figcaption className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone mb-ma-6">
                &mdash; The bigger question
              </figcaption>
              <h2
                className="font-editorial text-sumi tracking-[-0.02em] leading-[1.02]"
                style={{ fontSize: 'clamp(2.25rem, 5vw + 0.5rem, 4.75rem)' }}
              >
                Does this location<br />
                support the life<br />
                you want?
              </h2>
              <div className="mt-ma-8 flex items-center gap-ma-3">
                <span aria-hidden className="h-px w-12 sm:w-20 bg-sumi/30" />
                <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-sumi/40" />
                <span aria-hidden className="h-px flex-1 bg-sumi/30" />
              </div>
            </figure>
          </ScrollReveal>

          {/* Resolution + CTA */}
          <ScrollReveal>
            <div className="flex flex-col gap-ma-8">
              <p
                className="font-editorial text-sumi leading-[1.5] max-w-[560px]"
                style={{ fontSize: 'clamp(1.125rem, 0.6vw + 1rem, 1.375rem)' }}
              >
                JapanoMa helps you narrow down the location you want to live with.
              </p>
              <div className="flex flex-row flex-wrap items-end gap-x-ma-4 gap-y-ma-3 sm:gap-x-ma-6 pt-ma-4">
                <ButtonLink href="/quiz" size="lg">
                  Find Your Area
                </ButtonLink>
                <Link
                  href="/areas"
                  className="text-sumi-light text-xs tracking-[0.2em] uppercase font-ui font-medium border-b border-sumi/20 pb-1.5 transition-all duration-base ease-settle hover:text-sumi hover:border-sumi hover:tracking-[0.25em]"
                >
                  or explore all areas
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 03 — Decide First. Buy Second.
          The founding idea of the platform, set as a single calm
          column. A quiet aside in italic closes the thought.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch · 03
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                Our approach
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.02] mb-ma-12 sm:mb-ma-16"
              style={{ fontSize: 'clamp(2.25rem, 4vw + 0.75rem, 4rem)' }}
            >
              Decide First.<br />Buy Second.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="space-y-ma-6 text-sumi-light leading-body max-w-[600px]">
              <p className="text-lg">
                For Australian ski-lovers, especially families and repeat travellers who
                are tired of rising trip costs and booking friction, JapanoMa turns
                &ldquo;Should we buy?&rdquo; into a clear, step-by-step answer.
              </p>
              <p>
                Transparent total-cost models. Practical due diligence. Introductions to
                licensed local professionals when you&rsquo;re ready. You stay in control
                throughout.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-ma-16 sm:mt-ma-24 pt-ma-8 border-t border-border max-w-[600px]">
              <p className="font-editorial italic text-stone leading-[1.6]"
                 style={{ fontSize: 'clamp(1.125rem, 0.4vw + 1rem, 1.375rem)' }}>
                &mdash; Even if you don&rsquo;t buy, you&rsquo;ll leave with the truth.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 04 — Decision-Aid, Not Sales.
          The "what we are not" list. Each item is struck through
          with a thin rule — the negation made visual. Closing note
          reframes the positive intent.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch · 04
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                What we are not
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.04] mb-ma-12 sm:mb-ma-16"
              style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3.5rem)' }}
            >
              Decision-aid,<br />not sales.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <ul className="space-y-ma-4 sm:space-y-ma-6">
              {[
                'a "cheap akiya bargain" site.',
                'a Tokyo or Osaka yield marketplace.',
                'a hype-driven property broker.',
                'a "we\u2019ll find you the perfect house" concierge.',
              ].map((line, i) => (
                <li key={i} className="flex items-baseline gap-ma-4 pb-ma-3 border-b border-border">
                  <span className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone tabular-nums w-10 shrink-0">
                    No. 0{i + 1}
                  </span>
                  <span className="font-editorial text-sumi-light text-base sm:text-lg leading-[1.55] line-through decoration-sumi/15 decoration-[1px]">
                    We are not {line}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="mt-ma-12 sm:mt-ma-16 font-editorial text-sumi leading-[1.5] max-w-[600px]"
               style={{ fontSize: 'clamp(1.125rem, 0.6vw + 1rem, 1.375rem)' }}>
              We help you understand what ownership really looks like, before you
              commit. Northern Japan snow country, lifestyle-first. Non-metro by design.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 05 — Five Commitments.
          Numbered pillars as a typographic list. Each pillar has
          its own rule beneath to give weight; stagger the reveals
          but keep total cascade tight.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch · 05
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                Brand pillars
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.04] mb-ma-4"
              style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3.5rem)' }}
            >
              Five commitments.
            </h2>
            <p className="font-editorial italic text-stone leading-[1.6] max-w-[560px] mb-ma-16 sm:mb-ma-20"
               style={{ fontSize: 'clamp(1rem, 0.4vw + 0.875rem, 1.125rem)' }}>
              The standards we hold ourselves to, no matter which way your decision
              eventually goes.
            </p>
          </ScrollReveal>

          <ol className="space-y-ma-8 sm:space-y-ma-12">
            {PILLARS.map((pillar, i) => (
              <ScrollReveal key={pillar.name} delay={i * 60}>
                <li className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[5rem_1fr] gap-ma-4 sm:gap-ma-6 pb-ma-6 border-b border-border">
                  <span className="font-editorial text-stone tabular-nums leading-none pt-1"
                        style={{ fontSize: 'clamp(1.5rem, 1.2vw + 0.75rem, 2rem)' }}>
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-editorial text-sumi leading-[1.2] mb-ma-2"
                        style={{ fontSize: 'clamp(1.25rem, 0.8vw + 0.875rem, 1.5rem)', fontWeight: 400 }}>
                      {pillar.name}
                    </h3>
                    <p className="text-sumi-light text-[15px] sm:text-base leading-[1.65]">
                      {pillar.description}
                    </p>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 06 — The Nagano & Niigata Corridor.
          The geography of the initial launch. A metadata strip
          echoes the hero's dossier grammar — key facts set in
          tabular nums, then the prose follows.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:py-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch · 06
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                Launch focus
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.02] mb-ma-12"
              style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3.5rem)' }}
            >
              The Nagano &amp; Niigata corridor.
            </h2>
          </ScrollReveal>

          {/* Metadata strip — tabular facts, edge-to-edge rules */}
          <ScrollReveal delay={80}>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-ma-4 gap-x-ma-6 border-y border-border py-ma-6 mb-ma-12">
              {[
                { k: 'Cities', v: '13' },
                { k: 'Prefectures', v: '02' },
                { k: 'From Tokyo', v: '≤ 2 hrs' },
                { k: 'Corridor', v: 'Snow country' },
              ].map(({ k, v }) => (
                <div key={k} className="flex flex-col gap-1">
                  <dt className="font-ui text-[9px] tracking-[0.28em] uppercase text-stone">
                    {k}
                  </dt>
                  <dd className="font-editorial text-sumi text-lg sm:text-xl tabular-nums">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="space-y-ma-6 text-sumi-light leading-body max-w-[600px]">
              <p className="text-lg">
                Thirteen cities across two of Japan&rsquo;s most accessible and powder-rich
                prefectures. Accessible from Tokyo. Affordable entry points. Rich with
                powder and culture.
              </p>
              <p>
                From Iiyama — within thirty minutes of Nozawa Onsen, Madarao, and Togari —
                to the deep-snow villages of Niigata, this corridor offers serious skiing
                without serious-city prices.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-ma-12 sm:mt-ma-16">
              <ButtonLink href="/areas" variant="outline">View all areas</ButtonLink>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Ch · 07 — From ski trips to a home base.
          Closing note. Left-aligned — no centered marketing finale,
          just a quiet turn of the final page.
          ───────────────────────────────────────────────────────── */}
      <section className="relative bg-washi px-ma-6 sm:px-ma-12 py-ma-24 sm:pt-ma-32 sm:pb-ma-32">
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
            <div className="flex items-center gap-ma-4 mb-ma-16 sm:mb-ma-24">
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone tabular-nums shrink-0">
                Ch · 07
              </span>
              <span aria-hidden className="flex-1 h-px bg-sumi/20" />
              <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-stone shrink-0">
                End of plate
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="font-editorial text-sumi tracking-[-0.02em] leading-[1.02] mb-ma-12"
              style={{ fontSize: 'clamp(2.25rem, 4vw + 0.75rem, 4rem)' }}
            >
              From ski trips<br />to a home base.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-sumi-light leading-body max-w-[560px] text-lg mb-ma-12">
              Start with the areas. Understand what&rsquo;s available, what it costs, and
              what to watch out for. No pressure. No sales pitch.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-row flex-wrap items-end gap-x-ma-4 gap-y-ma-3 sm:gap-x-ma-6">
              <ButtonLink href="/areas" size="lg">
                Explore the areas
              </ButtonLink>
              <Link
                href="/contact"
                className="text-sumi-light text-xs tracking-[0.2em] uppercase font-ui font-medium border-b border-sumi/20 pb-1.5 transition-all duration-base ease-settle hover:text-sumi hover:border-sumi hover:tracking-[0.25em]"
              >
                or get in touch
              </Link>
            </div>
          </ScrollReveal>

          {/* Closing rule + dossier sign-off — the "colophon" of the plate */}
          <ScrollReveal delay={280}>
            <div className="mt-ma-24 sm:mt-ma-32 pt-ma-6 border-t border-sumi/15">
              <div className="flex flex-wrap items-center justify-between gap-ma-4 font-ui text-[10px] tracking-[0.28em] uppercase text-stone tabular-nums">
                <span>Vol. I &middot; MMXXVI</span>
                <span aria-hidden className="hidden sm:block flex-1 h-px bg-sumi/10 max-w-[120px]" />
                <span>Field Plate 01 &middot; Location first</span>
                <span aria-hidden className="hidden sm:block flex-1 h-px bg-sumi/10 max-w-[120px]" />
                <span className="font-editorial italic text-stone normal-case tracking-normal">
                  — fin. —
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

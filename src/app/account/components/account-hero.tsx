// src/app/account/components/account-hero.tsx
// Editorial hero with integrated journey state, contextual subtitle, and
// the inline 6-step stepper. Replaces the previous text-only welcome.
import Link from 'next/link';
import { NavMapInline } from '@/components/journey/nav-map-inline';
import { PhaseAdjustLink } from './phase-adjust-link';
import type { JourneyState } from '@/lib/journey/types';

type Props = {
  firstName: string;
  quizComplete: boolean;
  recommendedCount: number;
  journeyState: JourneyState;
};

export function AccountHero({ firstName, quizComplete, recommendedCount, journeyState }: Props) {
  // Pick the right primary CTA + subtitle based on journey state
  const cta = pickCta(quizComplete, recommendedCount, journeyState);
  const subtitle = pickSubtitle(quizComplete, recommendedCount, journeyState);

  return (
    <section className="mb-ma-16">
      {/* Editorial overline — journey context */}
      <div className="flex items-baseline justify-between mb-ma-3">
        <p className="label-overline text-stone">
          Step {journeyState.stepNumber} of 6 · {journeyState.userLabel}
        </p>
        {journeyState.isOverridden && journeyState.phaseOverriddenAt && (
          <p className="text-[11px] text-stone tabular-nums">
            adjusted {relativeDays(journeyState.phaseOverriddenAt)}
          </p>
        )}
      </div>

      {/* Hero greeting — large, generous */}
      <h1 className="font-editorial font-normal text-[32px] sm:text-[44px] leading-[1.08] text-sumi mb-ma-4">
        Welcome back, {firstName}.
      </h1>

      {/* Subtitle — contextual to journey state */}
      <p className="max-w-[560px] text-[15px] text-sumi-light leading-[1.65] mb-ma-8">
        {subtitle}
      </p>

      {/* Primary CTA + override link */}
      <div className="flex flex-wrap items-center gap-ma-4 mb-ma-12">
        {cta && (
          <Link
            href={cta.href}
            className="group inline-flex items-center gap-ma-2 h-11 px-ma-6 bg-ai text-kinu text-sm font-ui font-semibold rounded-md transition-[background-color,box-shadow,transform] duration-base ease-settle hover:bg-ai-deep hover:shadow-[0_4px_12px_-2px_rgba(61,90,122,0.35)] active:scale-[0.98]"
          >
            {cta.label}
            <span aria-hidden className="transition-transform duration-base ease-settle group-hover:translate-x-0.5">→</span>
          </Link>
        )}
        <PhaseAdjustLink />
      </div>

      {/* Inline stepper */}
      <NavMapInline state={journeyState} />
    </section>
  );
}

function pickCta(
  quizComplete: boolean,
  recommendedCount: number,
  state: JourneyState,
): { label: string; href: string } | null {
  // When the quiz hasn't been taken, the QuizPromptCard below owns the
  // primary conversion. No competing hero CTA — Ma Space rule of one
  // primary action per viewport.
  if (!quizComplete) return null;
  if (state.phase === '3_area' && recommendedCount > 0) {
    return { label: 'Express interest', href: '#recommendations' };
  }
  if (state.stepNumber >= 3) return { label: 'Browse content for your step', href: '/content' };
  return { label: 'Browse areas', href: '/areas' };
}

function pickSubtitle(
  quizComplete: boolean,
  recommendedCount: number,
  state: JourneyState,
): string {
  if (!quizComplete) {
    return 'Your decision-aid dashboard. Start with the five-minute area quiz below — it unlocks personalised recommendations and tailors what you see here.';
  }
  if (recommendedCount > 0 && state.stepNumber === 2) {
    const word = recommendedCount === 1 ? 'region' : 'regions';
    const fits = recommendedCount === 1 ? 'fits' : 'fit';
    return `${recommendedCount} ${word} ${fits} your profile. When you are ready to talk to a Japanese partner, express interest — we will introduce you within 48 hours.`;
  }
  return state.nextHint
    ? `Up next: ${state.nextHint.toLowerCase()}.`
    : 'Your decision-aid dashboard. Notes, bookmarks, and saved areas all in one place.';
}

function relativeDays(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import { createClient } from '@/lib/supabase/client';
import { MaDivider, ScrollReveal, OriginPicker } from '@/components/japandi';
import { CONDITION_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/quiz/questions';
import {
  AuOrigin,
  DEFAULT_ORIGIN,
  ORIGIN_COOKIE,
  isAuOrigin,
} from '@/lib/format/origin';
import { AreaResultCard } from './components/area-result-card';

// AUD primary, JPY secondary — aligns with the lib/format/price convention.
const BUDGET_LABELS: Record<string, string> = {
  'under-15m': 'Under A$135K · ¥15M',
  '15-30m': 'A$135K – A$270K · ¥15M – ¥30M',
  '30-50m': 'A$270K – A$450K · ¥30M – ¥50M',
  '50m+': 'A$450K+ · ¥50M+',
};

/**
 * Editorial numbered checklist item — replaces the SaaS-circle
 * checkmark pattern. Number is rendered in the editorial serif as a
 * left-rail marker with an indigo accent, and the body text sits
 * indented in body-line-height for proper reading rhythm.
 */
function ChecklistItem({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-ma-4">
      <span
        aria-hidden
        style={{
          fontFamily: 'var(--font-editorial)',
          fontWeight: 400,
          color: 'var(--ai)',
          fontSize: '20px',
          lineHeight: 1.4,
        }}
        className="tabular-nums shrink-0 w-6 text-right"
      >
        {n.toString().padStart(2, '0')}
      </span>
      <p className="text-sm text-sumi-light leading-body flex-1">
        {children}
      </p>
    </li>
  );
}

export default function QuizResultsPage() {
  const { results, profile, isComplete, reset } = useQuizStore();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [origin, setOriginState] = useState<AuOrigin>(DEFAULT_ORIGIN);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
  }, []);

  // Read the origin cookie set by the server action / OriginPicker so
  // the quiz card stat-row reflects the visitor's chosen home capital.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${ORIGIN_COOKIE}=([^;]+)`)
    );
    const value = match ? decodeURIComponent(match[1]) : null;
    if (isAuOrigin(value)) setOriginState(value);
  }, []);

  useEffect(() => {
    if (!isComplete || !results) {
      router.replace('/quiz');
    }
  }, [isComplete, results, router]);

  if (!results || !profile) return null;

  const areas = results;
  const topArea = areas[0];
  const conditionLabel = CONDITION_LABELS[profile.condition] ?? profile.condition;
  const typeLabels = profile.types.map((t) => PROPERTY_TYPE_LABELS[t] ?? t);
  const budgetLabel = BUDGET_LABELS[profile.budget] ?? profile.budget;

  return (
    <div className="mx-auto max-w-[680px] px-ma-6 pt-ma-12 pb-ma-24">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <ScrollReveal>
        <p className="label-overline mb-ma-4 text-stone">Your shortlist</p>
        <h1 className="font-editorial font-normal text-[28px] sm:text-[40px] leading-tight text-sumi mb-ma-6">
          {areas.length === 1
            ? 'This area fits your profile.'
            : `These ${areas.length} areas fit your profile.`}
        </h1>
        <p className="max-w-[560px] text-sm text-sumi-light leading-body">
          Based on your purpose, ski season, property preferences, budget, and priorities,
          here are the Japanese ski regions that align with your goals and trade-offs.
          Ranked by fit score, highest first.
        </p>
      </ScrollReveal>

      <MaDivider size="breath" />

      {/* ── Area grid — hero-first, then half cards ───────────────────────── */}
      <section>
        <ScrollReveal>
          <p className="mb-ma-1 text-[10px] font-bold uppercase tracking-[0.15em] text-stone">
            Your recommended areas
          </p>
          <p className="mb-ma-4 text-[11px] text-ash">Ranked by fit score, highest first.</p>
          <OriginPicker value={origin} variant="compact" onChange={setOriginState} />
        </ScrollReveal>

        {/*
          items-start prevents the grid from stretching each card to the
          tallest sibling — half-variant cards use line-clamp on the
          explanation so they end up at similar natural heights without
          ghost-space above the buttons.
        */}
        <div className="mt-ma-8 grid grid-cols-1 sm:grid-cols-2 items-start gap-ma-4 [&>*:first-child]:col-span-full">
          {areas.map((area, index) => (
            <ScrollReveal key={area.citySlug} index={index}>
              <AreaResultCard
                variant={index === 0 ? 'hero' : 'half'}
                topMatchBadge={index === 0}
                cityName={area.cityName}
                prefectureName={area.prefectureName}
                citySlug={area.citySlug}
                prefectureSlug={area.prefectureSlug}
                score={area.score}
                explanation={area.explanation}
                isAuthenticated={isAuthenticated}
                origin={origin}
                regionType={area.regionType}
                heroImagePath={area.heroImagePath}
                avgPropertyPriceJpy={area.avgPropertyPriceJpy}
                timeFromSydney={area.timeFromSydney}
                timeFromMelbourne={area.timeFromMelbourne}
                timeFromBrisbane={area.timeFromBrisbane}
                timeFromPerth={area.timeFromPerth}
                timeFromAdelaide={area.timeFromAdelaide}
                offSeasonActivitiesScore={area.offSeasonActivitiesScore}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <MaDivider size="zone" line />

      {/* ── Your Property Profile — receipt of inputs ─────────────────────── */}
      <section>
        <ScrollReveal>
          <p className="label-overline mb-ma-4 text-stone">Your property profile</p>
          <h2 className="font-editorial font-normal text-[24px] sm:text-[28px] leading-tight text-sumi mb-ma-8">
            What you&apos;re looking for
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="rounded-lg bg-shoji p-ma-6 sm:p-ma-8 border border-border">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-ma-6">
              <div>
                <dt className="label-overline text-stone mb-ma-2">Property type</dt>
                <dd className="text-sm font-medium text-sumi leading-snug">
                  {typeLabels.join(', ')}
                </dd>
              </div>
              <div>
                <dt className="label-overline text-stone mb-ma-2">Condition</dt>
                <dd className="text-sm font-medium text-sumi leading-snug">{conditionLabel}</dd>
              </div>
              <div>
                <dt className="label-overline text-stone mb-ma-2">Budget</dt>
                <dd className="text-sm font-medium text-sumi leading-snug tabular-nums">
                  {budgetLabel}
                </dd>
              </div>
            </dl>
            <div className="mt-ma-6 pt-ma-6 border-t border-border">
              <p className="text-sm text-sumi-light leading-body">{profile.summary}</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <MaDivider size="zone" line />

      {/* ── Personalised Checklist — the decision-aid payoff ──────────────── */}
      <section>
        <ScrollReveal>
          <p className="label-overline mb-ma-4 text-stone">Next steps</p>
          <h2 className="font-editorial font-normal text-[24px] sm:text-[28px] leading-tight text-sumi mb-ma-8">
            Your personalised checklist
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          {/* Editorial step list — drops the SaaS checkmark circles in
              favour of a numbered serif marker that aligns with the
              rest of the design language. */}
          <ol className="space-y-ma-6">
            {areas.slice(0, 2).map((area, i) => (
              <ChecklistItem key={`step-${area.citySlug}`} n={i + 1}>
                Read the{' '}
                <Link
                  href={`/areas/${area.prefectureSlug}/${area.citySlug}`}
                  className="text-sumi font-medium underline underline-offset-[3px] hover:text-ai transition-colors duration-base ease-settle"
                >
                  {area.cityName}
                </Link>{' '}
                area guide for access, infrastructure, and local context.
              </ChecklistItem>
            ))}
            <ChecklistItem n={areas.slice(0, 2).length + 1}>
              Understand total cost of ownership for{' '}
              <strong className="text-sumi font-medium">
                {typeLabels[0]?.toLowerCase() ?? 'properties'}
              </strong>{' '}
              in your budget range — purchase, taxes, upkeep, and management.
            </ChecklistItem>
            <ChecklistItem n={areas.slice(0, 2).length + 2}>
              When you&apos;re ready, talk to Go&amp;C about{' '}
              <strong className="text-sumi font-medium">
                {conditionLabel.toLowerCase()}
              </strong>{' '}
              properties in{' '}
              <strong className="text-sumi font-medium">
                {topArea?.prefectureName ?? 'your recommended areas'}
              </strong>
              .
            </ChecklistItem>
          </ol>
        </ScrollReveal>
      </section>

      <MaDivider size="zone" line />

      {/* ── Secondary CTA — auth-aware save/signup ────────────────────────── */}
      <ScrollReveal>
        <div className="rounded-lg bg-shoji p-ma-6 sm:p-ma-8 border border-border">
          {isAuthenticated ? (
            <>
              <h2 className="font-editorial font-normal text-[20px] text-sumi mb-ma-3">
                Your results are saved
              </h2>
              <p className="text-sm text-sumi-light leading-body mb-ma-4">
                We&apos;ll keep these here. Visit your account anytime to express interest or
                revisit the list.
              </p>
              <Link
                href="/account"
                className="text-sm text-ai hover:text-ai-deep underline underline-offset-[3px] transition-colors duration-base ease-settle"
              >
                Open your account →
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-editorial font-normal text-[20px] text-sumi mb-ma-3">
                Save these results for later
              </h2>
              <p className="text-sm text-sumi-light leading-body mb-ma-6">
                Create an account in one minute. No payment details, no spam. Your results
                and the Japanese partners you can introduce yourself to are all waiting for
                you inside.
              </p>
              <div className="flex flex-wrap items-center gap-ma-4">
                <Link
                  href="/signup?next=/quiz/results"
                  className="inline-block h-12 px-ma-6 bg-ai text-kinu text-sm font-semibold tracking-wide rounded-lg leading-[48px] hover:bg-ai-deep transition-colors duration-base ease-settle"
                >
                  Create account
                </Link>
                <span className="text-xs text-stone">
                  Already have one?{' '}
                  <Link
                    href="/login?next=/quiz/results"
                    className="text-ai underline underline-offset-[3px] hover:text-ai-deep transition-colors duration-base ease-settle"
                  >
                    Sign in →
                  </Link>
                </span>
              </div>
            </>
          )}
        </div>
      </ScrollReveal>

      {/* ── Footer — retake + contact lifeline ────────────────────────────── */}
      <div className="mt-ma-12 text-center">
        <p className="text-[11px] text-stone">
          Not quite right?{' '}
          <button
            type="button"
            onClick={() => {
              reset();
              router.push('/quiz');
            }}
            className="text-ai underline underline-offset-[3px] hover:text-ai-deep transition-colors duration-base ease-settle"
          >
            Retake the quiz →
          </button>
        </p>
        <p className="mt-ma-3 text-[11px] text-stone">
          Questions about these results?{' '}
          <Link
            href="/contact?source=quiz"
            className="text-ai underline underline-offset-[3px] hover:text-ai-deep transition-colors duration-base ease-settle"
          >
            Contact Go&amp;C →
          </Link>
        </p>
      </div>
    </div>
  );
}

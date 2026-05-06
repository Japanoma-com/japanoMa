// src/components/journey/phase-filter-primary-row.tsx
// Journey-timeline phase filter for /content. The 6 D2L steps are
// rendered as numbered nodes connected by a hairline track, reading
// left-to-right as the journey itself does. Compared to a row of 7
// equal-weight pills (the previous design), this gives the filter
// visual hierarchy: it reads as a path with a current position
// rather than a list of buttons.
//
// Each node is a Link to /content?phase=<id>. The user's inferred
// journey phase is marked with an indigo ring + dot ("you're here")
// so they can choose to filter to it or step elsewhere.
import Link from 'next/link';
import type { JourneyState, Phase } from '@/lib/journey/types';
import { PHASE_RANK } from '@/lib/journey/phase-mapping';

type Step = { phase: Phase; n: number; label: string; short: string };
const STEPS: Step[] = [
  { n: 1, phase: '1_decision',      label: 'Decide First',     short: 'Decide' },
  { n: 2, phase: '3_area',          label: 'Choose Area',      short: 'Area' },
  { n: 3, phase: '4_shortlist',     label: 'Shortlist Homes',  short: 'Shortlist' },
  { n: 4, phase: '5_due_diligence', label: 'Check Risks',      short: 'Risks' },
  { n: 5, phase: '6_offer',         label: 'Make Offer',       short: 'Offer' },
  { n: 6, phase: '7_pre_close',     label: 'Prepare Closing',  short: 'Closing' },
];

type Props = {
  state: JourneyState;
  activePhase: Phase | null;
  baseUrl: string;
};

function buildHref(baseUrl: string, phaseId: Phase | null): string {
  if (!phaseId) return baseUrl;
  return `${baseUrl}?${new URLSearchParams({ phase: phaseId }).toString()}`;
}

export function PhaseFilterPrimaryRow({ state, activePhase, baseUrl }: Props) {
  // Default highlight = activePhase from URL, else inferred phase if non-default.
  const inferredHasValue = PHASE_RANK[state.phase] > 0;
  const showingPhase = activePhase ?? (inferredHasValue ? state.phase : null);
  const showingStep = STEPS.find((s) => s.phase === showingPhase) ?? null;
  const youStep = STEPS.find((s) => s.phase === state.phase) ?? null;

  return (
    <div className="my-ma-6">
      <div className="flex items-baseline justify-between gap-ma-3 mb-ma-4">
        <p className="label-overline text-stone">Filter by step</p>
        {showingPhase && (
          <Link
            href={buildHref(baseUrl, null)}
            className="text-[11px] font-ui text-stone hover:text-sumi transition-colors duration-base ease-settle inline-flex items-center gap-1"
          >
            <span aria-hidden className="text-stone/60">×</span>
            Show all
          </Link>
        )}
      </div>

      {/*
        Timeline track. The hairline sits behind the nodes; nodes are
        flex-1 spaced so they distribute evenly across whatever width
        the parent provides. Numbers inside circles + short labels
        below; full label appears in the caption when filtered.
      */}
      <div className="relative">
        {/* Hairline connector — runs through the centre of the node row */}
        <div
          aria-hidden
          className="absolute top-[14px] left-[18px] right-[18px] h-px bg-border"
        />

        <ol className="relative flex items-start justify-between gap-ma-1">
          {STEPS.map((s) => {
            const active = showingPhase === s.phase;
            const isYou = state.phase === s.phase && !active;
            return (
              <li key={s.phase} className="flex-1 min-w-0">
                <Link
                  href={buildHref(baseUrl, s.phase)}
                  aria-current={active ? 'true' : undefined}
                  aria-label={s.label}
                  className="group flex flex-col items-center gap-ma-2 outline-none"
                >
                  <span
                    className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-ui font-medium tabular-nums transition-[background-color,color,box-shadow,transform,ring-color] duration-base ease-settle ${
                      active
                        ? 'bg-ai text-kinu shadow-[0_2px_10px_-2px_rgba(61,90,122,0.45)] scale-[1.12]'
                        : isYou
                          ? 'bg-kinu text-ai ring-1 ring-ai/40 group-hover:ring-ai/70 group-hover:scale-105'
                          : 'bg-shoji text-sumi-light shadow-card group-hover:bg-kinu group-hover:text-sumi group-hover:scale-105 group-focus-visible:ring-1 group-focus-visible:ring-ai/60'
                    }`}
                  >
                    {s.n}
                    {isYou && (
                      <span
                        aria-hidden
                        className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-ai"
                      />
                    )}
                  </span>
                  <span
                    className={`hidden sm:block text-[10px] text-center leading-tight tracking-tight transition-colors duration-base ease-settle truncate w-full ${
                      active
                        ? 'text-sumi font-semibold'
                        : isYou
                          ? 'text-ai font-medium'
                          : 'text-stone group-hover:text-sumi'
                    }`}
                  >
                    {s.short}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Caption — discloses the full label and surfaces a quiet
          "your step" hint when applicable. Reserved space (min-h)
          so the layout doesn't shift between filtered/unfiltered. */}
      <p className="mt-ma-4 text-[11px] text-stone leading-relaxed min-h-[16px]">
        {showingStep ? (
          <>
            Currently filtering to{' '}
            <span className="text-sumi font-medium">{showingStep.label}</span>
            {state.phase === showingStep.phase && (
              <span className="text-ai"> · your step</span>
            )}
          </>
        ) : youStep ? (
          <>
            Showing all steps · your step is{' '}
            <Link
              href={buildHref(baseUrl, youStep.phase)}
              className="text-ai hover:text-ai-deep underline underline-offset-[3px] decoration-ai/30 hover:decoration-ai-deep transition-colors duration-base ease-settle"
            >
              {youStep.label}
            </Link>
          </>
        ) : (
          <span className="text-stone/60">
            Pick a step to focus the content. Click any node above.
          </span>
        )}
      </p>
    </div>
  );
}

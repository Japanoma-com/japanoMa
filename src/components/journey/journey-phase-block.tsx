// src/components/journey/journey-phase-block.tsx
// Top section of /account — editorial hero around the inline stepper.
'use client';
import { useState } from 'react';
import { NavMapInline } from './nav-map-inline';
import { PhaseOverrideModal } from './phase-override-modal';
import type { JourneyState } from '@/lib/journey/types';

type Props = { state: JourneyState };

function relativeDays(iso: string | null): string {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

export function JourneyPhaseBlock({ state }: Props) {
  const [overrideOpen, setOverrideOpen] = useState(false);

  return (
    <section className="mb-ma-16">
      {/* Editorial header */}
      <div className="flex items-baseline justify-between mb-ma-2">
        <p className="label-overline text-stone">Your Journey</p>
        {state.isOverridden && state.phaseOverriddenAt && (
          <p className="text-[11px] text-stone tabular-nums">
            adjusted {relativeDays(state.phaseOverriddenAt)}
          </p>
        )}
      </div>
      <h1 className="font-editorial text-3xl md:text-4xl text-sumi leading-[1.15] mb-ma-1">
        {state.userLabel}
      </h1>
      <p className="text-sm text-sumi-light mb-ma-8">
        Step {state.stepNumber} of 6
      </p>

      {/* Stepper */}
      <NavMapInline state={state} />

      {/* Calm escape hatch */}
      <div className="mt-ma-6 flex justify-end">
        <button
          onClick={() => setOverrideOpen(true)}
          className="text-xs text-stone hover:text-sumi transition-colors duration-base ease-settle inline-flex items-center gap-1"
        >
          Adjust my step
          <span aria-hidden className="text-[10px]">↗</span>
        </button>
      </div>

      <PhaseOverrideModal open={overrideOpen} onClose={() => setOverrideOpen(false)} />
    </section>
  );
}

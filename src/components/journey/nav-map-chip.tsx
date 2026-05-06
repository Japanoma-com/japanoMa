// src/components/journey/nav-map-chip.tsx
// Header chip — premium pill with status dot. Click opens the journey sheet.
'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useJourneyState } from '@/lib/journey/use-journey-state';
import type { JourneyState } from '@/lib/journey/types';

const NavMapChipSheet = dynamic(
  () => import('./nav-map-chip-sheet').then((m) => m.NavMapChipSheet),
  { ssr: false }
);

type Props = {
  initialState: JourneyState;
  signedIn: boolean;
};

export function NavMapChip({ initialState, signedIn }: Props) {
  const [open, setOpen] = useState(false);
  const { state } = useJourneyState();
  const display = state ?? initialState;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label={`Open journey map — currently on step ${display.stepNumber} of 6`}
        className="group relative inline-flex items-center gap-ma-2 h-8 px-ma-3 rounded-full
                   bg-shoji hover:bg-kinu
                   transition-[background-color,box-shadow,transform] duration-base ease-settle
                   hover:shadow-card active:scale-[0.98]"
      >
        {/* Status dot — pulses on the current step */}
        <span className="relative flex w-1.5 h-1.5" aria-hidden>
          <span className="absolute inline-flex w-full h-full rounded-full bg-ai opacity-50 animate-ping" />
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-ai" />
        </span>
        <span className="text-[11px] font-ui font-medium text-sumi-light tracking-tight tabular-nums">
          {display.stepNumber}/6
        </span>
        <span className="w-px h-3 bg-ash/40" aria-hidden />
        <span className="text-[12px] font-ui text-sumi group-hover:text-ai-deep transition-colors duration-base ease-settle">
          {display.userLabel}
        </span>
      </button>
      {open && (
        <NavMapChipSheet
          state={display}
          signedIn={signedIn}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

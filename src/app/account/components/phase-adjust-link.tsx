// src/app/account/components/phase-adjust-link.tsx
// Small client island that opens the PhaseOverrideModal. Lives next to
// the hero CTA so users can correct their step without navigating away.
'use client';
import { useState } from 'react';
import { PhaseOverrideModal } from '@/components/journey/phase-override-modal';

export function PhaseAdjustLink() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-ui text-stone hover:text-sumi transition-colors duration-base ease-settle"
      >
        Adjust my step
        <span aria-hidden className="text-[10px]">↗</span>
      </button>
      <PhaseOverrideModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

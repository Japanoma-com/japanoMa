// src/components/journey/phase-accordion.tsx
// Smooth accordion row used by NotesByPhase. Animated chevron + height,
// hover state on the trigger, refined typography. Client island.
'use client';
import { useState, type ReactNode } from 'react';

type Props = {
  label: string;
  count: number;
  defaultOpen?: boolean;
  actions?: ReactNode;     // e.g. "+ Add note" button shown only when expanded
  children: ReactNode;
};

export function PhaseAccordion({
  label, count, defaultOpen = false, actions, children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-lg bg-kinu overflow-hidden transition-[box-shadow] duration-slow ease-settle ${open ? 'shadow-card' : ''} hover:shadow-card`}>
      <div className="flex items-stretch">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex-1 flex items-center justify-between gap-ma-3 px-ma-4 py-ma-3 text-left transition-colors duration-base ease-settle hover:bg-shoji/50 focus:outline-none focus-visible:bg-shoji/50 rounded-lg"
        >
          <span className="flex items-center gap-ma-3">
            <ChevronIcon open={open} />
            <span className="font-ui text-sm text-sumi font-medium">{label}</span>
            <span className="text-xs text-stone tabular-nums">
              {count} note{count === 1 ? '' : 's'}
            </span>
          </span>
        </button>
        {open && actions && (
          <div className="flex items-center pr-ma-4">{actions}</div>
        )}
      </div>

      {open && (
        <div className="px-ma-4 pb-ma-4 pt-ma-1">
          {children}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`text-stone transition-transform duration-base ease-settle ${open ? 'rotate-90' : ''}`}
    >
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

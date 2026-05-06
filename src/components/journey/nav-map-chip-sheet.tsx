// src/components/journey/nav-map-chip-sheet.tsx
// Right-edge journey panel. Portal-mounted to <body> to escape the header's
// z-50 stacking context. Backdrop has subtle blur; panel slides + content
// stagger on enter. Modern, calm, Ma-Space-coherent.
'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { phaseToStepNumber } from '@/lib/journey/phase-mapping';
import type { JourneyState } from '@/lib/journey/types';
import { PhaseOverrideModal } from './phase-override-modal';

const STEPS = [
  { n: 1, label: 'Decide First',    href: '/quiz',    desc: 'Clarify your purpose and constraints.' },
  { n: 2, label: 'Choose Area',     href: '/areas',   desc: 'Narrow to 2–4 ecosystem areas.' },
  { n: 3, label: 'Shortlist Homes', href: '/account', desc: 'Save and compare candidates.' },
  { n: 4, label: 'Check Risks',     href: '/content?phase=5_due_diligence', desc: 'Title, condition, tax — the boring saves you.' },
  { n: 5, label: 'Make Offer',      href: '/account', desc: 'Express interest with conditions.' },
  { n: 6, label: 'Prepare Closing', href: '/content?phase=7_pre_close', desc: 'POA, payments, insurance.' },
] as const;

type Props = {
  state: JourneyState;
  signedIn: boolean;
  onClose: () => void;
};

export function NavMapChipSheet({ state, signedIn, onClose }: Props) {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closingRef = useRef(false);

  // Mounted gate so SSR doesn't try to render through createPortal.
  useEffect(() => { setMounted(true); }, []);

  // Animate in on mount: backdrop fades, panel slides from right.
  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 320);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    // Lock body scroll while sheet is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const current = phaseToStepNumber(state.phase);

  const panel = (
    <div role="dialog" aria-modal="true" aria-label="Your journey map"
         className="fixed inset-0 z-[60]">
      {/* Backdrop with subtle blur — modern frosted-glass feel */}
      <button
        aria-label="Close map"
        onClick={close}
        className={`absolute inset-0 bg-sumi/40 backdrop-blur-sm cursor-default transition-opacity duration-300 ease-settle ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md
                    bg-washi flex flex-col overflow-y-auto
                    shadow-[-24px_0_48px_-12px_rgba(26,24,22,0.18)]
                    transition-transform duration-[320ms] ease-settle
                    ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Hairline separator on the leading edge — Ma Space restraint */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" aria-hidden />

        {/* Header */}
        <div className="flex items-center justify-between px-ma-8 pt-ma-8 pb-ma-4">
          <p className="label-overline text-stone">Your Journey</p>
          <button
            onClick={close}
            className="w-8 h-8 -mr-ma-2 flex items-center justify-center text-stone hover:text-sumi transition-colors duration-base ease-settle rounded-full hover:bg-shoji"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Hero block — current step, prominent */}
        <div className="px-ma-8 pb-ma-6">
          <h2 className="font-editorial text-3xl text-sumi mb-ma-2 leading-[1.15]">
            {STEPS[current - 1]?.label ?? 'Your journey'}
          </h2>
          <p className="text-sm text-sumi-light leading-relaxed">
            Step {current} of 6 · {state.nextHint}
          </p>
        </div>

        {/* Steps — connected dots with progress rail */}
        <ol className="relative px-ma-8 pb-ma-6">
          {/* Vertical rail — runs from first dot to last */}
          <div
            className="absolute left-[36px] top-[20px] bottom-[20px] w-px bg-border"
            aria-hidden
          />
          <div
            className="absolute left-[36px] top-[20px] w-px bg-ai transition-[height] duration-700 ease-settle"
            style={{
              height: visible ? `calc(${(Math.max(0, current - 1) / (STEPS.length - 1)) * 100}% - 0px)` : '0%',
            }}
            aria-hidden
          />
          {STEPS.map((s, i) => {
            const status = s.n < current ? 'done' : s.n === current ? 'current' : 'future';
            return (
              <li
                key={s.n}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 400ms var(--ease-settle) ${100 + i * 60}ms, transform 400ms var(--ease-settle) ${100 + i * 60}ms`,
                }}
              >
                {/* Whole row is one click target — modern industry standard */}
                <Link
                  href={s.href}
                  onClick={close}
                  className="group relative flex items-start gap-ma-4 py-ma-3 -mx-ma-3 px-ma-3 rounded-lg transition-colors duration-base ease-settle hover:bg-shoji focus:outline-none focus-visible:ring-2 focus-visible:ring-ai focus-visible:bg-shoji"
                >
                  {/* Dot indicator */}
                  <span
                    className={`relative z-10 flex-shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center transition-all duration-base ease-settle ${
                      status === 'done'
                        ? 'bg-ai text-kinu'
                        : status === 'current'
                        ? 'bg-ai text-kinu ring-4 ring-ai/15'
                        : 'bg-shoji ring-1 ring-ash/30 text-stone group-hover:ring-ai/40 group-hover:text-ai'
                    }`}
                    aria-hidden
                  >
                    {status === 'done' ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5.5L4 7.5L8.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="text-[10px] font-ui font-bold">{s.n}</span>
                    )}
                  </span>

                  <div className="flex-1 -mt-px">
                    <p className={`text-sm font-ui font-semibold transition-colors duration-base group-hover:text-ai ${
                      status === 'current' ? 'text-sumi' : status === 'done' ? 'text-sumi-light' : 'text-stone'
                    }`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-stone mt-1 leading-relaxed">{s.desc}</p>
                  </div>

                  {/* Forward arrow on hover — modern affordance */}
                  <span
                    aria-hidden
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-base ease-settle text-ai self-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        {/* Override link — calm, tucked, signed-in only */}
        {signedIn && (
          <div
            className="px-ma-8 pb-ma-8 mt-auto pt-ma-6"
            style={{
              opacity: visible ? 1 : 0,
              transition: `opacity 300ms var(--ease-settle) ${100 + STEPS.length * 60 + 100}ms`,
            }}
          >
            <button
              onClick={() => setOverrideOpen(true)}
              className="text-xs text-stone hover:text-sumi transition-colors duration-base ease-settle inline-flex items-center gap-1"
            >
              Adjust my step
              <span aria-hidden className="text-[10px]">↗</span>
            </button>
          </div>
        )}

        <PhaseOverrideModal open={overrideOpen} onClose={() => setOverrideOpen(false)} />
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

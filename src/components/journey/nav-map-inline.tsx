// src/components/journey/nav-map-inline.tsx
// Editorial 6-step stepper — connected dots with a progress rail.
// RSC-only. Mounted on /account, /quiz, /content, /areas, /compare.
import Link from 'next/link';
import type { JourneyState } from '@/lib/journey/types';
import { phaseToStepNumber } from '@/lib/journey/phase-mapping';

const STEPS: Array<{ n: number; label: string; href: string }> = [
  { n: 1, label: 'Decide First',    href: '/quiz' },
  { n: 2, label: 'Choose Area',     href: '/areas' },
  { n: 3, label: 'Shortlist Homes', href: '/account' },
  { n: 4, label: 'Check Risks',     href: '/content?phase=5_due_diligence' },
  { n: 5, label: 'Make Offer',      href: '/account' },
  { n: 6, label: 'Prepare Closing', href: '/content?phase=7_pre_close' },
];

type Props = { state: JourneyState };

export function NavMapInline({ state }: Props) {
  const current = phaseToStepNumber(state.phase);
  const progressPercent = ((current - 1) / (STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Buying journey progress" className="my-ma-8">
      {/* Desktop: horizontal stepper with connecting rail */}
      <div className="hidden md:block">
        <ol className="relative flex items-start">
          {/* Background rail — full width between first and last dot */}
          <div
            className="absolute top-[14px] left-[14px] right-[14px] h-px bg-border"
            aria-hidden
          />
          {/* Progress rail — fills from left to current step */}
          <div
            className="absolute top-[14px] left-[14px] h-px bg-ai transition-[width] duration-700 ease-settle"
            style={{ width: `calc((100% - 28px) * ${progressPercent / 100})` }}
            aria-hidden
          />

          {STEPS.map((s) => {
            const status = s.n < current ? 'done' : s.n === current ? 'current' : 'future';
            return (
              <Step key={s.n} step={s} status={status} />
            );
          })}
        </ol>
      </div>

      {/* Mobile: vertical stepper */}
      <ol className="md:hidden relative space-y-ma-3">
        <div
          className="absolute left-[14px] top-[14px] bottom-[14px] w-px bg-border"
          aria-hidden
        />
        <div
          className="absolute left-[14px] top-[14px] w-px bg-ai transition-[height] duration-700 ease-settle"
          style={{ height: `calc(${progressPercent}% - 0px)` }}
          aria-hidden
        />
        {STEPS.map((s) => {
          const status = s.n < current ? 'done' : s.n === current ? 'current' : 'future';
          return <StepMobile key={s.n} step={s} status={status} />;
        })}
      </ol>

      {/* Next-action caption — refined typography */}
      <p className="mt-ma-6 text-[13px] text-sumi-light leading-relaxed">
        <span className="font-ui font-semibold text-sumi">Next:</span>{' '}
        <span className="text-stone">{state.nextHint}</span>
      </p>
    </nav>
  );
}

function Dot({ status, n }: { status: 'done' | 'current' | 'future'; n: number }) {
  return (
    <span
      className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-base ease-settle
        ${status === 'done' ? 'bg-ai text-kinu'
          : status === 'current' ? 'bg-ai text-kinu ring-4 ring-ai/15'
          : 'bg-shoji ring-1 ring-ash/30 text-stone'}`}
      aria-hidden
    >
      {status === 'done' ? (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2.5 6L4.5 8L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <span className="text-[11px] font-ui font-bold tabular-nums">{n}</span>
      )}
    </span>
  );
}

function Step({ step, status }: { step: { n: number; label: string; href: string }; status: 'done' | 'current' | 'future' }) {
  const labelClass =
    status === 'current' ? 'text-sumi font-semibold' :
    status === 'done' ? 'text-sumi-light' :
    'text-stone';

  return (
    <li className="flex-1">
      <Link href={step.href} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ai focus-visible:ring-offset-2 focus-visible:ring-offset-washi rounded-md">
        <div className="flex flex-col items-center gap-ma-2 px-ma-1">
          <Dot status={status} n={step.n} />
          <span className={`text-[11px] font-ui ${labelClass} text-center leading-tight max-w-[80px] transition-colors duration-base ease-settle group-hover:text-ai`}>
            {step.label}
          </span>
        </div>
      </Link>
    </li>
  );
}

function StepMobile({ step, status }: { step: { n: number; label: string; href: string }; status: 'done' | 'current' | 'future' }) {
  const labelClass =
    status === 'current' ? 'text-sumi font-semibold' :
    status === 'done' ? 'text-sumi-light' :
    'text-stone';

  return (
    <li>
      <Link
        href={step.href}
        className="flex items-center gap-ma-3 py-ma-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ai rounded-md"
      >
        <Dot status={status} n={step.n} />
        <span className={`text-sm font-ui ${labelClass} transition-colors duration-base ease-settle group-hover:text-ai`}>
          {step.label}
        </span>
      </Link>
    </li>
  );
}

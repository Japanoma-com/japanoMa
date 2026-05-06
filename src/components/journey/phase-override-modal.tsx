// src/components/journey/phase-override-modal.tsx
// Calm modal for manual phase adjustment. Portal-mounted, animated,
// matches the sheet's modern visual vocabulary.
'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { setPhaseOverride } from '@/lib/journey/actions';
import { useJourneyState } from '@/lib/journey/use-journey-state';
import type { Phase } from '@/lib/journey/types';

const OPTIONS: Array<{ phase: Phase; label: string; n: number }> = [
  { n: 1, phase: '1_decision',      label: 'Decide First' },
  { n: 2, phase: '3_area',          label: 'Choose Area' },
  { n: 3, phase: '4_shortlist',     label: 'Shortlist Homes' },
  { n: 4, phase: '5_due_diligence', label: 'Check Risks' },
  { n: 5, phase: '6_offer',         label: 'Make Offer' },
  { n: 6, phase: '7_pre_close',     label: 'Prepare Closing' },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PhaseOverrideModal({ open, onClose }: Props) {
  const { state, refresh } = useJourneyState();
  const [selected, setSelected] = useState<Phase | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closingRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open || !mounted) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) {
      closingRef.current = false;
      setVisible(false);
      setSelected(null);
      setError(null);
    }
  }, [open]);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 220);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted || !open) return null;

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    const result = await setPhaseOverride({ phase: selected });
    setSubmitting(false);
    if ('success' in result) {
      await refresh();
      // Server-rendered surfaces (hero overline, stepper) won't update from
      // a client-only SWR refresh; force a full page reload so the next
      // render reflects the new phase everywhere.
      if (typeof window !== 'undefined') {
        window.location.reload();
      } else {
        close();
      }
    } else if (result.error === 'rate_limited') {
      setError("You've adjusted your step a few times — give the system a moment.");
    } else if (result.error === 'unauthorized') {
      setError('Please sign in to adjust your step.');
    } else {
      setError('Could not adjust your step. Please try again.');
    }
  };

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Adjust your step"
      className="fixed inset-0 z-[70] flex items-center justify-center px-ma-6"
    >
      <button
        onClick={close}
        aria-label="Close"
        className={`absolute inset-0 bg-sumi/40 backdrop-blur-sm cursor-default transition-opacity duration-200 ease-settle ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        className={`relative w-full max-w-md bg-washi rounded-2xl shadow-[0_24px_60px_-12px_rgba(26,24,22,0.25)] overflow-hidden transition-[opacity,transform] duration-200 ease-settle ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.98]'}`}
      >
        <div className="px-ma-6 pt-ma-6 pb-ma-2">
          <div className="flex items-center justify-between mb-ma-2">
            <p className="label-overline text-stone">Override</p>
            <button
              onClick={close}
              aria-label="Close"
              className="w-7 h-7 -mr-ma-1 flex items-center justify-center text-stone hover:text-sumi rounded-full hover:bg-shoji transition-colors duration-base ease-settle"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <h2 className="font-editorial text-2xl text-sumi leading-tight">Where are you, really?</h2>
          <p className="text-sm text-sumi-light mt-ma-2 leading-relaxed">
            Pick the step that matches your current reality. We&apos;ll defer to you.
          </p>
        </div>

        <div className="px-ma-3 py-ma-3">
          {OPTIONS.map((opt) => {
            const isCurrent = state?.phase === opt.phase;
            const isSelected = selected === opt.phase;
            return (
              <label
                key={opt.phase}
                className={`flex items-center gap-ma-3 px-ma-3 py-ma-3 rounded-lg cursor-pointer transition-colors duration-base ease-settle ${
                  isSelected ? 'bg-ai/10' : 'hover:bg-shoji'
                }`}
              >
                <input
                  type="radio"
                  name="phase"
                  value={opt.phase}
                  checked={isSelected}
                  onChange={() => setSelected(opt.phase)}
                  className="sr-only"
                />
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-base ease-settle ${
                    isSelected
                      ? 'bg-ai ring-2 ring-ai'
                      : 'bg-kinu ring-2 ring-ash/40'
                  }`}
                  aria-hidden
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-kinu" />}
                </span>
                <span className="flex-1 flex items-baseline justify-between">
                  <span className={`text-sm font-ui ${isSelected ? 'text-sumi font-semibold' : 'text-sumi-light'}`}>
                    {opt.n}. {opt.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] text-stone uppercase tracking-wider">current</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>

        {error && (
          <div className="mx-ma-6 mb-ma-2 px-ma-3 py-ma-2 rounded-md bg-beni/5 border-l-2 border-beni">
            <p className="text-xs text-beni leading-relaxed">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-ma-2 px-ma-6 py-ma-4 bg-shoji/50">
          <button
            onClick={close}
            className="px-ma-4 h-9 text-sm font-ui text-stone hover:text-sumi transition-colors duration-base ease-settle"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting || (error?.includes('few times') ?? false)}
            className="px-ma-4 h-9 text-sm font-ui font-semibold bg-ai text-kinu rounded-md hover:bg-ai-deep transition-colors duration-base ease-settle disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Updating…' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

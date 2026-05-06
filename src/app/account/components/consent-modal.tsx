'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Spinner } from '@/components/japandi/spinner';

type Props = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  consentBody: string;
  consentVersion: string;
  areaLabel: string;
  isSubmitting: boolean;
  errorMessage: string | null;
};

export function ConsentModal({
  isOpen,
  onCancel,
  onConfirm,
  consentBody,
  consentVersion,
  areaLabel,
  isSubmitting,
  errorMessage,
}: Props) {
  const [agreed, setAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Mounted gate so createPortal only runs after document.body exists.
  // SSR has no document, so the modal returns null on the server pass.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset agreement state when modal opens
  useEffect(() => {
    if (isOpen) setAgreed(false);
  }, [isOpen]);

  // Initial focus on cancel + focus return on close
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => cancelRef.current?.focus(), 0);
      return () => clearTimeout(t);
    } else {
      previouslyFocused.current?.focus();
    }
  }, [isOpen]);

  // Escape closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel]);

  // Focus trap: Tab cycles within modal contents
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
        'input, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const paragraphs = consentBody.split(/\n\n+/).filter((p) => p.trim().length > 0);

  // Render via React Portal so the fixed-position backdrop escapes any
  // ancestor with a transform/will-change/filter/perspective property — those
  // create a containing block for fixed-position descendants and break z-index
  // stacking. The /account ScrollReveal wrappers (which use transform for the
  // staggered reveal) trigger exactly this issue, so we render to document.body.
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-ma-4 sm:p-ma-6"
      style={{ background: 'rgba(26, 24, 22, 0.6)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && onCancel()}
    >
      <div
        ref={modalRef}
        className="bg-washi rounded-lg w-full max-w-[640px] flex flex-col overflow-hidden"
        style={{
          boxShadow: '0 12px 40px rgba(26,24,22,0.2)',
          maxHeight: 'min(90vh, 800px)',
        }}
      >
        {/* Header — fixed, doesn't shrink */}
        <div className="shrink-0 px-ma-6 sm:px-ma-12 pt-ma-6 sm:pt-ma-12 pb-ma-6">
          <h2
            id="consent-modal-title"
            className="font-editorial font-normal text-[22px] text-sumi"
          >
            Consent to share your interest
          </h2>
          <p className="mt-1 text-[11px] text-stone">
            Version {consentVersion} · Effective April 2026
          </p>
          <p className="mt-ma-6 text-sm text-sumi leading-body">
            To introduce you to a Japanese partner regarding <strong>{areaLabel}</strong>,
            we&apos;ll share the following information with them.
          </p>
        </div>

        {/*
          Scrollable consent body. The trick: overflow-y-auto DIRECTLY on the
          flex-1 min-h-0 element, no wrapper. flex-1 grows to fill the
          remaining space; min-h-0 lets it shrink below its intrinsic content
          size so overflow-y-auto actually clips + scrolls. This is the
          canonical pattern — no absolute positioning, no h-full indirection.
        */}
        <div className="flex-1 min-h-0 overflow-y-auto border-t border-b border-border px-ma-6 sm:px-ma-12 py-ma-4">
          {paragraphs.map((para, i) => (
            <p key={i} className="mb-ma-4 text-sm text-sumi-light leading-body">
              {para}
            </p>
          ))}
        </div>

        {/* Footer — fixed, doesn't shrink, always visible */}
        <div className="shrink-0 px-ma-6 sm:px-ma-12 pt-ma-6 pb-ma-6 sm:pb-ma-12">
          {/* Agreement checkbox */}
          <label
            htmlFor="consent-agree-checkbox"
            className="flex items-start gap-ma-3 cursor-pointer"
          >
            <input
              id="consent-agree-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 w-4 h-4 accent-ai"
            />
            <span className="text-sm text-sumi">
              I have read and agree to the above. (Version {consentVersion})
            </span>
          </label>

          {/* Error slot */}
          {errorMessage && (
            <p className="mt-ma-3 text-[11px] text-beni" role="alert">
              {errorMessage}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-ma-3 mt-ma-6">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-12 px-ma-6 text-sm font-semibold tracking-wide text-stone hover:text-sumi disabled:opacity-60 transition-colors duration-base ease-settle rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!agreed || isSubmitting}
              className="h-12 px-ma-6 text-sm font-semibold tracking-wide bg-ai text-kinu rounded-lg hover:bg-ai-deep disabled:bg-ai/40 disabled:text-kinu/80 disabled:cursor-not-allowed inline-flex items-center justify-center gap-ma-2 transition-colors duration-base ease-settle min-w-[180px]"
            >
              {isSubmitting && <Spinner size="md" />}
              <span>{isSubmitting ? 'Submitting…' : 'Confirm and share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

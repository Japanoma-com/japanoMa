'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { deactivateAccount } from '../actions';
import { Spinner } from '@/components/japandi/spinner';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function DeactivateAccountModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial focus on the confirm button + return focus on close. The
  // primary action gets focus rather than an input — there's no
  // type-to-confirm gate now since deactivation is reversible.
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => confirmBtnRef.current?.focus(), 0);
      return () => clearTimeout(t);
    } else {
      previouslyFocused.current?.focus();
    }
  }, [isOpen]);

  // Escape closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

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

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setServerError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  async function handleDeactivate() {
    setIsSubmitting(true);
    setServerError(null);
    const result = await deactivateAccount();
    if (result && 'error' in result) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }
    if (result && 'redirectTo' in result) {
      router.push(result.redirectTo);
      router.refresh();
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-ma-6"
      style={{ background: 'rgba(26, 24, 22, 0.6)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className="bg-washi rounded-2xl max-w-[480px] w-full p-ma-8 md:p-ma-12 shadow-[0_12px_40px_rgba(26,24,22,0.2)]"
      >
        <h2
          id="deactivate-modal-title"
          className="font-editorial font-normal text-[24px] text-sumi mb-ma-3 leading-tight"
        >
          Deactivate your account
        </h2>
        <p className="text-sm text-sumi-light leading-relaxed mb-ma-4">
          Pauses your account and signs you out. Your saved areas, quiz
          results, journey notes, bookmarks, and interest records all stay
          intact — we keep them for you in case you choose to come back.
        </p>
        <p className="text-sm text-sumi-light leading-relaxed mb-ma-6">
          To <strong>reactivate</strong>, just sign in again with the same
          email. No separate request needed.
        </p>

        {serverError && (
          <div className="mb-ma-4 rounded-md bg-beni/5 border-l-2 border-beni px-ma-4 py-ma-3">
            <p className="text-[12px] text-beni leading-relaxed">{serverError}</p>
          </div>
        )}

        <div className="flex justify-end gap-ma-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 px-ma-6 text-sm font-semibold tracking-wide text-stone hover:text-sumi disabled:opacity-60 transition-colors duration-base ease-settle rounded-lg"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={handleDeactivate}
            disabled={isSubmitting}
            className="h-11 px-ma-6 text-sm font-semibold tracking-wide bg-ai text-kinu rounded-lg hover:bg-ai-deep disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-ma-2 transition-colors duration-base ease-settle min-w-[180px] shadow-[0_2px_10px_-2px_rgba(61,90,122,0.4)]"
          >
            {isSubmitting && <Spinner size="md" />}
            <span>{isSubmitting ? 'Deactivating…' : 'Deactivate account'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

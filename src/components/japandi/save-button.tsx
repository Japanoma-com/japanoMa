'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSavesStore } from '@/stores/saves-store';
import { toggleSave } from '@/app/account/save-actions';

type SaveButtonProps = {
  contentType: 'city' | 'article';
  contentId: string;
  title: string;
  href: string;
  /**
   * Auth state of the current viewer — passed from the parent server
   * component (area detail, content article, etc). Anonymous viewers save
   * to localStorage and get a sign-up hint; authenticated viewers call the
   * toggleSave server action directly.
   */
  isAuthenticated: boolean;
  /**
   * Only used for authenticated viewers — the initial saved state, computed
   * server-side from the saves table. Prevents a flicker where the button
   * renders "Save" before a client fetch resolves. Ignored for anonymous
   * viewers (who read from Zustand).
   */
  initialSaved?: boolean;
};

export function SaveButton({
  contentType,
  contentId,
  title,
  href,
  isAuthenticated,
  initialSaved = false,
}: SaveButtonProps) {
  const { isSaved: isSavedLocally, toggleSave: toggleLocalSave } = useSavesStore();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [authedSaved, setAuthedSaved] = useState(initialSaved);
  const [showGuestHint, setShowGuestHint] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Auto-hide the guest hint after 4 seconds
  useEffect(() => {
    if (!showGuestHint) return;
    const t = setTimeout(() => setShowGuestHint(false), 4000);
    return () => clearTimeout(t);
  }, [showGuestHint]);

  // Before hydration, treat as not saved to avoid mismatch.
  const saved = !mounted
    ? false
    : isAuthenticated
      ? authedSaved
      : isSavedLocally(contentType, contentId);

  function handleToggle() {
    if (isAuthenticated) {
      // Server-action path with optimistic UI
      const previouslySaved = authedSaved;
      setAuthedSaved(!previouslySaved);
      startTransition(async () => {
        const result = await toggleSave({ contentType, contentId, title, href });
        if ('error' in result) {
          // Revert on failure
          setAuthedSaved(previouslySaved);
          console.error('toggleSave failed:', result.error);
          return;
        }
        // Sync to server's canonical state (should match optimistic value)
        setAuthedSaved(result.saved);
      });
    } else {
      // Anonymous path — Zustand, and trigger the signup hint on NEW saves
      const wasSaved = isSavedLocally(contentType, contentId);
      toggleLocalSave({
        contentType,
        contentId,
        title,
        href,
        savedAt: new Date().toISOString(),
      });
      // Only show the hint when ADDING a save, not when removing one
      if (!wasSaved) setShowGuestHint(true);
    }
  }

  const signupHref = `/signup?next=${encodeURIComponent(pathname ?? '/')}`;

  return (
    <div className="relative inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="group flex items-center gap-ma-2 text-sm transition-colors duration-base ease-settle disabled:opacity-60"
        aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
        aria-pressed={saved}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-base ease-settle ${
            saved ? 'text-ai scale-110' : 'text-stone group-hover:text-ai-deep'
          }`}
          aria-hidden="true"
        >
          <path d="M9 15.5l-6.3-6.3a3.5 3.5 0 115 -5L9 5.5l1.3-1.3a3.5 3.5 0 115 5L9 15.5z" />
        </svg>
        <span
          className={`transition-colors duration-base ease-settle ${
            saved ? 'text-ai' : 'text-stone group-hover:text-sumi-light'
          }`}
        >
          {saved ? 'Saved' : 'Save'}
        </span>
      </button>

      {showGuestHint && (
        <div
          role="status"
          className="absolute top-full left-0 mt-ma-2 z-10 w-max max-w-[320px] bg-sumi text-kinu text-[11px] leading-relaxed px-ma-4 py-ma-3 rounded-lg shadow-card-hover"
        >
          Saved locally.{' '}
          <Link
            href={signupHref}
            className="underline underline-offset-[3px] text-kinu hover:text-ai/80"
          >
            Sign up to keep across devices →
          </Link>
        </div>
      )}
    </div>
  );
}

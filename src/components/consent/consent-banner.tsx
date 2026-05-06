'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { setConsent } from './actions';

/**
 * Analytics consent banner.
 *
 * Renders only when the `analytics_consent` cookie is absent (undecided).
 * Two outcomes: Allow → sets cookie to "granted", page reloads so the
 * layout includes the Plausible script; Decline → "declined", no reload
 * needed (analytics already wasn't running).
 *
 * `initialDecided` comes from the server layout so we avoid a flash of
 * banner for users who've already chosen.
 */
export function ConsentBanner({ initialDecided }: { initialDecided: boolean }) {
  const [visible, setVisible] = useState(!initialDecided);
  const [isPending, startTransition] = useTransition();

  // Defense-in-depth: also re-check the cookie on mount in case it was
  // set in another tab after this page's initial HTML was built.
  useEffect(() => {
    if (initialDecided) return;
    if (typeof document !== 'undefined' && document.cookie.includes('analytics_consent=')) {
      setVisible(false);
    }
  }, [initialDecided]);

  if (!visible) return null;

  const handleDecision = (value: 'granted' | 'declined') => {
    startTransition(async () => {
      await setConsent(value);
      setVisible(false);
    });
  };

  return (
    <div
      role="dialog"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-body"
      className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="ma-page px-ma-6 pb-ma-4">
        <div className="bg-shoji border border-border rounded-lg shadow-card p-ma-6 sm:p-ma-8 flex flex-col sm:flex-row sm:items-start gap-ma-4 sm:gap-ma-6">
          <div className="flex-1 min-w-0">
            <p
              id="consent-banner-title"
              className="label-overline text-ai mb-ma-2"
            >
              Privacy
            </p>
            <p
              id="consent-banner-body"
              className="text-sm text-sumi-light leading-relaxed"
            >
              We use privacy-friendly analytics (Plausible — cookieless) plus
              in-database event counters to understand how Japanoma is used.
              No personal data, no advertising trackers. See our{' '}
              <Link
                href="/privacy"
                className="text-ai underline underline-offset-2 hover:text-ai-deep"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-ma-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleDecision('declined')}
              disabled={isPending}
              className="px-ma-4 py-ma-2 rounded-md text-xs font-semibold tracking-wide uppercase border border-border text-sumi-light hover:bg-washi transition-colors duration-base ease-settle disabled:opacity-50"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => handleDecision('granted')}
              disabled={isPending}
              className="px-ma-4 py-ma-2 rounded-md text-xs font-semibold tracking-wide uppercase bg-ai text-kinu hover:bg-ai-deep transition-colors duration-base ease-settle disabled:opacity-50"
            >
              Allow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

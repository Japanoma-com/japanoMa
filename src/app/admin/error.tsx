'use client';

/**
 * Admin-subtree error boundary. Replaces the global error screen so a
 * query blowup on one admin page doesn't throw the user out to the
 * generic "Something went wrong" view — the admin chrome (nav, header)
 * stays usable.
 *
 * We log the error to the console so it still surfaces in Vercel's
 * function logs while keeping the visible message calm and actionable.
 */
import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin] section error:', error);
  }, [error]);

  return (
    <div className="bg-shoji border border-border rounded-lg p-ma-12 text-center max-w-xl mx-auto">
      <p className="label-overline text-kohaku mb-ma-3">Something tripped</p>
      <h2 className="text-2xl font-editorial text-sumi mb-ma-4">
        This admin view hit an error.
      </h2>
      <p className="text-sm text-sumi-light mb-ma-6 leading-relaxed">
        One of the queries on this page didn&apos;t return what the UI was
        expecting. The rest of the admin is still working — try again, or
        check another tab.
      </p>
      {error.digest && (
        <p className="text-xs text-stone font-mono mb-ma-6">
          Ref: {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="inline-block px-ma-4 py-ma-2 rounded-md text-xs font-semibold tracking-wide uppercase bg-ai text-kinu hover:bg-ai-deep transition-colors duration-base ease-settle"
      >
        Try again
      </button>
    </div>
  );
}

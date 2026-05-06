'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

/**
 * Preset date-range chips (7 / 30 / 90 days). Writes from/to into URL
 * search params; server components re-fetch with the new range.
 */
export function DateRangeControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const applyRange = (days: number) => {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', from.toISOString().slice(0, 10));
    params.set('to', to.toISOString().slice(0, 10));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const currentFrom = searchParams.get('from');
  const currentTo = searchParams.get('to');

  const inferPreset = (): number | null => {
    if (!currentFrom || !currentTo) return 30;
    const d = (new Date(currentTo).getTime() - new Date(currentFrom).getTime()) / (1000 * 60 * 60 * 24);
    if ([7, 30, 90].some((p) => Math.abs(p - d) < 1)) return Math.round(d);
    return null;
  };
  const active = inferPreset();

  return (
    <div
      className="inline-flex items-center gap-ma-1 bg-shoji border border-border rounded-md p-1"
      role="group"
      aria-label="Date range"
    >
      {[7, 30, 90].map((days) => (
        <button
          key={days}
          type="button"
          onClick={() => applyRange(days)}
          disabled={isPending}
          className={`px-ma-3 py-ma-1 text-xs font-semibold tracking-wide uppercase rounded-sm transition-colors duration-base ease-settle disabled:opacity-50 ${
            active === days
              ? 'bg-ai text-kinu'
              : 'text-sumi-light hover:bg-washi'
          }`}
        >
          {days}d
        </button>
      ))}
    </div>
  );
}

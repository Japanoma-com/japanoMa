'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AU_ORIGINS, AuOrigin } from '@/lib/format/origin';
import { setOrigin } from '@/lib/format/origin-actions';

type Variant = 'inline' | 'compact';

type Props = {
  /** Currently-selected origin (controlled). Server reads from cookie; the
   *  parent client component then holds the state and re-renders dependents. */
  value: AuOrigin;
  /** Visual treatment — `inline` for a labelled row, `compact` for tight headers. */
  variant?: Variant;
  /**
   * Hook called the moment the user picks a new origin. Used by client
   * pages to swap labels/highlights *before* the cookie is persisted, so
   * the UI feels instant. The picker fires-and-forgets the cookie write
   * in a transition; if `onChange` is provided we *don't* router.refresh
   * (the parent already handled the visual change).
   */
  onChange?: (next: AuOrigin) => void;
};

/**
 * Lets the visitor pick which Australian capital is "home" so every
 * "From X" label across the site reflects their actual journey. Kaz
 * flagged in the CRA-76 update that anchoring everything to Sydney
 * misrepresents travel time for QLD buyers (highest expected volume).
 *
 * UX rule: the picker writes the cookie in the background but never
 * blocks the UI on it. Parent client components own the displayed
 * origin so labels swap instantly with no flicker, no router refresh,
 * no DB re-fetch.
 */
export function OriginPicker({
  value,
  variant = 'inline',
  onChange,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleChange(next: AuOrigin) {
    if (next === value) return;
    // Optimistic update first — visible state flips immediately so the
    // user sees their choice take effect before the cookie round-trip.
    onChange?.(next);
    const fd = new FormData();
    fd.set('origin', next);
    startTransition(async () => {
      await setOrigin(fd);
      // Only refresh server-rendered routes when the parent didn't take
      // ownership of the displayed value. Prevents the jumpy double-paint
      // on /areas where the directory grid is already swapping client-side.
      if (!onChange) router.refresh();
    });
  }

  if (variant === 'compact') {
    return (
      <label className="inline-flex items-center gap-ma-2 text-xs text-stone">
        <span className="uppercase tracking-[0.12em]">From</span>
        <select
          aria-label="Your home capital"
          value={value}
          onChange={(e) => handleChange(e.target.value as AuOrigin)}
          className="bg-kinu border border-border rounded-md text-sumi text-xs font-medium tracking-wide cursor-pointer hover:border-ai/60 px-ma-2 py-[3px] transition-colors duration-base ease-settle"
        >
          {AU_ORIGINS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-ma-3 text-xs">
      <span className="label-overline text-stone">Your home capital</span>
      {/*
        Pill row stays on a single line at every viewport. On phones we
        render 3-letter airport codes (SYD/MEL/BNE/PER/ADL) plus the
        full label at sm+ so wider screens still read as words.
        flex-nowrap + a w-full container ensures the row never wraps;
        each button uses flex-1 so the row sizes itself to fit edge-
        to-edge with equal columns.
      */}
      <div
        role="radiogroup"
        aria-label="Choose your home capital so travel times reflect your journey"
        className="flex flex-nowrap items-stretch gap-[2px] rounded-md bg-shoji p-[3px] border border-border w-full sm:w-auto"
      >
        {AU_ORIGINS.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => handleChange(o.id)}
              aria-label={o.label}
              className={[
                'flex-1 sm:flex-none px-ma-2 sm:px-ma-3 h-7 rounded text-[11px] font-medium tracking-wide transition-colors duration-base ease-settle whitespace-nowrap',
                active
                  ? 'bg-ai text-kinu shadow-[0_1px_2px_rgba(61,90,122,0.25)]'
                  : 'text-sumi-light hover:bg-kinu hover:text-sumi',
              ].join(' ')}
            >
              <span className="sm:hidden">{o.code}</span>
              <span className="hidden sm:inline">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

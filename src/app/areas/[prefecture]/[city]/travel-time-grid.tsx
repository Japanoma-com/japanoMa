'use client';

import { useState } from 'react';
import {
  AU_ORIGINS,
  AuOrigin,
  formatFlightTime,
  originLabel,
} from '@/lib/format/origin';
import { OriginPicker } from '@/components/japandi/origin-picker';

type Props = {
  initialOrigin: AuOrigin;
  times: {
    sydney: string | null;
    melbourne: string | null;
    brisbane: string | null;
    perth: string | null;
    adelaide: string | null;
  };
};

/**
 * Door-to-door travel-time grid on the city detail page. Holds the
 * origin in client state so the picker swap is instant — no route
 * refresh, no DB re-fetch, no flicker. The OriginPicker fires its
 * server action in a background transition to persist the cookie.
 *
 * Five capitals always rendered (where the city has data); the
 * visitor's chosen capital is boxed in indigo and tagged "· You".
 */
export function TravelTimeGrid({ initialOrigin, times }: Props) {
  const [origin, setOrigin] = useState<AuOrigin>(initialOrigin);

  const cells = AU_ORIGINS.map((o) => ({
    id: o.id,
    label: o.label,
    raw: times[o.id],
  })).filter((c) => c.raw);

  if (cells.length === 0) return null;

  return (
    <div className="mb-ma-8">
      <div className="flex flex-wrap items-end justify-between gap-ma-4 mb-ma-4">
        <p className="label-overline text-stone">
          Door-to-door travel time from {originLabel(origin)}
        </p>
        <OriginPicker
          value={origin}
          variant="compact"
          onChange={setOrigin}
        />
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-5 gap-ma-4 text-sm">
        {cells.map((c) => {
          const isOrigin = c.id === origin;
          return (
            <div
              key={c.id}
              className={
                'transition-colors duration-base ease-settle ' +
                (isOrigin
                  ? 'rounded-md bg-shoji border border-ai/40 p-ma-3'
                  : 'p-ma-3')
              }
            >
              <dt
                className={`text-xs ${
                  isOrigin ? 'text-ai font-medium' : 'text-stone'
                }`}
              >
                {c.label}
                {isOrigin && (
                  <span className="ml-ma-1 text-[10px] uppercase tracking-[0.12em]">
                    · You
                  </span>
                )}
              </dt>
              <dd className="text-sumi font-editorial text-xl tabular-nums">
                {formatFlightTime(c.raw)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

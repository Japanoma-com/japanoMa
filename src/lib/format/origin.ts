/**
 * Australian home origin — drives the "From X" travel-time labels we
 * render on area cards and city pages.
 *
 * Kaz's CRA-76 update (Apr 2026) noted that highest volume is expected
 * from QLD because Brisbane is closer to Japan, and that anchoring all
 * copy to Sydney misrepresents the journey for non-NSW buyers.
 *
 * Persistence: a non-HttpOnly cookie so client + server can both read
 * it without an extra round-trip. Not security-sensitive — it's a UX
 * preference.
 */

export const ORIGIN_COOKIE = 'japanoma-origin';
export const ORIGIN_COOKIE_MAX_AGE_DAYS = 365;

export type AuOrigin =
  | 'sydney'
  | 'melbourne'
  | 'brisbane'
  | 'perth'
  | 'adelaide';

export const AU_ORIGINS: ReadonlyArray<{
  id: AuOrigin;
  label: string;
  /** 3-letter airport code — used as the compact label on small viewports
   *  so the picker stays on one row regardless of phone width. */
  code: string;
  state: string;
}> = [
  { id: 'sydney',    label: 'Sydney',    code: 'SYD', state: 'NSW' },
  { id: 'melbourne', label: 'Melbourne', code: 'MEL', state: 'VIC' },
  { id: 'brisbane',  label: 'Brisbane',  code: 'BNE', state: 'QLD' },
  { id: 'perth',     label: 'Perth',     code: 'PER', state: 'WA' },
  { id: 'adelaide',  label: 'Adelaide',  code: 'ADL', state: 'SA' },
];

export const DEFAULT_ORIGIN: AuOrigin = 'sydney';

export function isAuOrigin(value: string | null | undefined): value is AuOrigin {
  return (
    value === 'sydney' ||
    value === 'melbourne' ||
    value === 'brisbane' ||
    value === 'perth' ||
    value === 'adelaide'
  );
}

export function originLabel(origin: AuOrigin): string {
  return AU_ORIGINS.find((o) => o.id === origin)?.label ?? 'Sydney';
}

/**
 * Pick the right travel-time string from a city row given the chosen
 * origin. Returns null if the city has no time recorded for that
 * origin (older P2/P3 rows or the one untouched P1).
 */
export function pickTimeForOrigin(
  origin: AuOrigin,
  times: {
    timeFromSydney?: string | null;
    timeFromMelbourne?: string | null;
    timeFromBrisbane?: string | null;
    timeFromPerth?: string | null;
    timeFromAdelaide?: string | null;
  }
): string | null {
  switch (origin) {
    case 'sydney':
      return times.timeFromSydney ?? null;
    case 'melbourne':
      return times.timeFromMelbourne ?? null;
    case 'brisbane':
      return times.timeFromBrisbane ?? null;
    case 'perth':
      return times.timeFromPerth ?? null;
    case 'adelaide':
      return times.timeFromAdelaide ?? null;
  }
}

/**
 * Format a "HH:MM" door-to-door time as "12h 23m" / "12h" for display.
 * Falls through to the raw string when the format is unexpected.
 */
export function formatFlightTime(value: string | null | undefined): string {
  if (!value) return '';
  const m = value.match(/^(\d+):(\d+)$/);
  if (!m) return value;
  const hours = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

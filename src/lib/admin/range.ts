/**
 * Shared date-range resolution for admin pages.
 *
 * Every admin route follows the same pattern:
 *   const range = params.from || params.to ? parseRange(params) : defaultRange(30);
 * This helper collapses that into one call and applies per-view defaults.
 */
import { defaultRange, parseRange, type DateRange } from './queries';

export function parseRangeOrDefault(
  params: { from?: string; to?: string },
  defaultDays = 30
): DateRange {
  if (params.from || params.to) return parseRange(params);
  return defaultRange(defaultDays);
}

export function formatRangeLabel(range: DateRange): string {
  return `${range.from.toISOString().slice(0, 10)} → ${range.to.toISOString().slice(0, 10)}`;
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

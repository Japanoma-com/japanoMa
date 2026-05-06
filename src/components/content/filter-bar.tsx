'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type Option = { label: string; value: string };

const AREA_OPTIONS: Option[] = [
  { label: 'Nagano', value: 'nagano' },
  { label: 'Niigata', value: 'niigata' },
  { label: 'Hokkaido', value: 'hokkaido' },
];
const TYPE_OPTIONS: Option[] = [
  { label: 'Detached House', value: 'detached-house' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Akiya', value: 'akiya' },
  { label: 'Land', value: 'land' },
  { label: 'Kominka', value: 'kominka' },
];
const USE_CASE_OPTIONS: Option[] = [
  { label: 'Holiday Home', value: 'holiday-home' },
  { label: 'Ski Lifestyle', value: 'ski-lifestyle' },
  { label: 'Investment', value: 'investment' },
  { label: 'Retirement', value: 'retirement' },
];
const BUYER_TYPE_OPTIONS: Option[] = [
  { label: 'Remote',     value: 'remote' },
  { label: 'Seasonal',   value: 'seasonal' },
  { label: 'Retirement', value: 'retirement' },
];

type FilterConfig = {
  label: string;
  param: string;
  options: Option[];
};

const FILTERS: FilterConfig[] = [
  { label: 'Area',          param: 'area',      options: AREA_OPTIONS },
  { label: 'Property Type', param: 'type',      options: TYPE_OPTIONS },
  { label: 'Use Case',      param: 'use',       options: USE_CASE_OPTIONS },
  { label: 'Buyer Type',    param: 'buyerType', options: BUYER_TYPE_OPTIONS },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback((param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }
    params.delete('page');
    router.push(`/content?${params.toString()}`);
  }, [router, searchParams]);

  const clearAll = useCallback(() => {
    // Preserve the journey-driven phase param (top-tier filter); only clear
    // the secondary chips this component owns.
    const params = new URLSearchParams(searchParams.toString());
    for (const f of FILTERS) params.delete(f.param);
    params.delete('page');
    const qs = params.toString();
    router.push(`/content${qs ? '?' + qs : ''}`);
  }, [router, searchParams]);

  const hasFilters = FILTERS.some((f) => searchParams.get(f.param));

  // Shared classnames for the dropdowns. No visible border — definition
  // comes from the soft card shadow (resting), a deeper lift on hover,
  // and a 1px indigo ring when the filter has a value or focus. Matches
  // the PhasePill / AreaCardFrame borderless treatment used elsewhere.
  const chevronBg =
    "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20stroke%3D%22%238A8279%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M3%204.5l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat";

  return (
    <div className="flex flex-wrap gap-ma-2 items-center">
      {FILTERS.map((filter) => {
        const isActive = !!searchParams.get(filter.param);
        return (
          <select
            key={filter.param}
            value={searchParams.get(filter.param) || ''}
            onChange={(e) => updateFilter(filter.param, e.target.value)}
            aria-label={`Filter by ${filter.label.toLowerCase()}`}
            className={[
              'appearance-none rounded-full h-9 pl-ma-4 pr-10 text-[12px] font-ui font-medium cursor-pointer',
              'transition-[background-color,box-shadow,color] duration-base ease-settle',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-ai/60',
              isActive
                ? 'bg-kinu text-sumi shadow-card ring-1 ring-ai/40'
                : 'bg-shoji text-sumi-light shadow-card hover:bg-kinu hover:text-sumi hover:shadow-[0_2px_12px_rgba(26,24,22,0.08)]',
              chevronBg,
            ].join(' ')}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      })}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="ml-ma-1 text-[11px] font-ui text-stone hover:text-sumi transition-colors duration-base ease-settle underline underline-offset-[3px] decoration-stone/40 hover:decoration-sumi"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

'use client';

import { useCompareStore, type CompareItem } from '@/stores/compare-store';
import { useState, useEffect } from 'react';

export function CompareButton(props: CompareItem) {
  const { isAdded, addItem, removeItem, items } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const added = isAdded(props.citySlug);
  const full = items.length >= 3 && !added;

  function handleClick() {
    if (added) {
      removeItem(props.citySlug);
    } else if (!full) {
      addItem(props);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={full}
      className={`flex items-center gap-ma-2 text-sm transition-colors duration-base ease-settle ${
        added
          ? 'text-ai'
          : full
            ? 'text-ash cursor-not-allowed'
            : 'text-stone hover:text-ai'
      }`}
      aria-label={added ? `Remove ${props.cityName} from comparison` : `Add ${props.cityName} to comparison`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {added ? (
          <path d="M3 8l3.5 3.5L13 5" />
        ) : (
          <>
            <path d="M8 3v10M3 8h10" />
          </>
        )}
      </svg>
      <span>{added ? 'Added' : full ? 'Full (3/3)' : 'Compare'}</span>
    </button>
  );
}

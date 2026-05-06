'use client';

import { useCompareStore } from '@/stores/compare-store';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CompareTray() {
  const { items, removeItem } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || items.length === 0) return null;

  const compareUrl = `/compare?cities=${items.map((i) => i.citySlug).join(',')}`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="ma-page px-ma-6 pb-ma-4">
        <div className="bg-sumi text-shoji rounded-lg shadow-lg p-ma-4 flex items-center justify-between gap-ma-4">
          <div className="flex items-center gap-ma-3 flex-1 min-w-0">
            <span className="text-xs text-ash flex-shrink-0">{items.length}/3</span>
            <div className="flex gap-ma-2 overflow-hidden">
              {items.map((item) => (
                <button
                  key={item.citySlug}
                  onClick={() => removeItem(item.citySlug)}
                  className="flex items-center gap-1 bg-sumi-light/50 rounded-md px-2 py-1 text-xs text-shoji hover:bg-beni/30 transition-colors duration-base ease-settle flex-shrink-0"
                  aria-label={`Remove ${item.cityName}`}
                >
                  {item.cityName}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 2l6 6M8 2l-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <Link
            href={compareUrl}
            className={`flex-shrink-0 px-ma-4 py-ma-2 rounded-md text-xs font-semibold tracking-wide uppercase transition-all duration-base ease-settle ${
              items.length >= 2
                ? 'bg-ai text-shoji hover:bg-ai-deep'
                : 'bg-sumi-light/30 text-ash cursor-not-allowed pointer-events-none'
            }`}
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}

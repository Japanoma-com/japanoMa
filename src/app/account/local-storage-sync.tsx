'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSavesStore } from '@/stores/saves-store';
import { migrateAnonymousData } from './actions';

export function LocalStorageSync() {
  const items = useSavesStore((state) => state.items);
  const hasRun = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasRun.current) return;
    if (typeof window === 'undefined') return;

    // Wait for Zustand to hydrate from localStorage
    if (!useSavesStore.persist.hasHydrated()) return;

    hasRun.current = true;

    const localStorageSaves = items.map((item) => ({
      contentType: item.contentType,
      contentId: item.contentId,
      title: item.title,
      href: item.href,
    }));

    migrateAnonymousData(localStorageSaves)
      .then((result) => {
        if (result && 'error' in result) {
          console.error('Migration failed:', result.error);
          return;
        }
        // Trigger RSC re-render so the sidebar + main column see the migrated data
        router.refresh();
      })
      .catch((err) => {
        console.error('Migration error:', err);
      });
  }, [items, router]);

  return null;
}

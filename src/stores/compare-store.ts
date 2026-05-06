import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackCompareAdd, trackCompareRemove } from '@/lib/events/actions';

export type CompareItem = {
  citySlug: string;
  cityName: string;
  prefectureSlug: string;
  prefectureName: string;
};

interface CompareState {
  items: CompareItem[];
  isAdded: (citySlug: string) => boolean;
  addItem: (item: CompareItem) => void;
  removeItem: (citySlug: string) => void;
  clear: () => void;
}

const MAX_ITEMS = 3;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      isAdded: (citySlug) => get().items.some((i) => i.citySlug === citySlug),

      addItem: (item) => {
        const state = get();
        if (state.items.length >= MAX_ITEMS) return;
        if (state.items.some((i) => i.citySlug === item.citySlug)) return;
        set({ items: [...state.items, item] });
        // Fire-and-forget analytics — consent-gated on the server.
        void trackCompareAdd({ citySlug: item.citySlug, cityName: item.cityName });
      },

      removeItem: (citySlug) => {
        const state = get();
        if (!state.items.some((i) => i.citySlug === citySlug)) return;
        set({ items: state.items.filter((i) => i.citySlug !== citySlug) });
        void trackCompareRemove({ citySlug });
      },

      clear: () => set({ items: [] }),
    }),
    { name: 'japanoma-compare-v1' }
  )
);

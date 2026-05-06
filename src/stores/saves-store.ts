import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SavedItem = {
  contentType: 'city' | 'article';
  contentId: string;
  title: string;
  href: string;
  savedAt: string;
};

interface SavesState {
  items: SavedItem[];
  isSaved: (contentType: string, contentId: string) => boolean;
  toggleSave: (item: SavedItem) => void;
  removeSave: (contentType: string, contentId: string) => void;
  clearAll: () => void;
}

export const useSavesStore = create<SavesState>()(
  persist(
    (set, get) => ({
      items: [],

      isSaved: (contentType, contentId) =>
        get().items.some((i) => i.contentType === contentType && i.contentId === contentId),

      toggleSave: (item) =>
        set((state) => {
          const exists = state.items.some(
            (i) => i.contentType === item.contentType && i.contentId === item.contentId
          );
          if (exists) {
            return { items: state.items.filter(
              (i) => !(i.contentType === item.contentType && i.contentId === item.contentId)
            )};
          }
          return { items: [item, ...state.items] };
        }),

      removeSave: (contentType, contentId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.contentType === contentType && i.contentId === contentId)
          ),
        })),

      clearAll: () => set({ items: [] }),
    }),
    { name: 'japanoma-saves-v1' }
  )
);

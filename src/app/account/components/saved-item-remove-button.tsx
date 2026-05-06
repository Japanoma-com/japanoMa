'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleSave } from '../save-actions';
import { Spinner } from '@/components/japandi/spinner';

type Props = {
  contentType: 'city' | 'article';
  contentId: string;
  title: string;
  href: string;
};

/**
 * Small "×" button rendered on each saved item in the /account SavedItemsSection.
 * Calls toggleSave (which removes the save if it already exists) and refreshes
 * the RSC tree so the item disappears from the list.
 */
export function SavedItemRemoveButton({ contentType, contentId, title, href }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const result = await toggleSave({ contentType, contentId, title, href });
      if ('error' in result) {
        console.error('Failed to remove saved item:', result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-stone transition-colors duration-base ease-settle hover:bg-beni/[0.08] hover:text-beni focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beni focus-visible:ring-offset-2 focus-visible:ring-offset-shoji disabled:cursor-wait"
      aria-label={isPending ? `Removing ${title}…` : `Remove ${title} from saved`}
    >
      {isPending ? (
        <Spinner size="sm" />
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      )}
    </button>
  );
}

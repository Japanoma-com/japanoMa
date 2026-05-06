'use client';
import { useTransition } from 'react';
import { deleteBookmark } from '@/lib/journey/actions';

export function DeleteBookmarkButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => { void deleteBookmark(id); })}
      disabled={pending}
      className="text-xs text-stone hover:text-beni disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}

// src/components/journey/notes-editor.tsx
'use client';
import { useState, useTransition } from 'react';
import { createNote } from '@/lib/journey/actions';
import type { Phase } from '@/lib/journey/types';

type Props = { phase: Phase };

export function NotesEditor({ phase }: Props) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!body.trim()) return;
    startTransition(async () => {
      setError(null);
      const result = await createNote({ phase, body });
      if ('success' in result) {
        setBody('');
        setOpen(false);
      } else {
        setError(result.error === 'rate_limited' ? 'Slow down a moment.' : 'Could not save note.');
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-ui font-medium text-ai hover:text-ai-deep transition-colors duration-base ease-settle"
        aria-label={`Add a note to ${phase}`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Add note
      </button>
    );
  }

  return (
    <div className="mt-ma-3">
      <div className="rounded-md bg-kinu shadow-card ring-1 ring-transparent focus-within:ring-ai/30 transition-[box-shadow] duration-base ease-settle">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={20000}
          autoFocus
          placeholder="Capture a thought… markdown supported (**bold**, [link](https://…), - lists)"
          className="w-full bg-transparent border-0 resize-none focus:outline-none font-ui text-sm text-sumi-light placeholder:text-ash p-ma-3 leading-relaxed"
        />
        <div className="flex items-center justify-between gap-ma-3 px-ma-3 py-ma-2 bg-shoji/40 rounded-b-md">
          <span className="text-[11px] text-ash tabular-nums">
            {body.length} / 20000
          </span>
          <div className="flex items-center gap-ma-2">
            <button
              onClick={() => { setOpen(false); setBody(''); setError(null); }}
              className="px-ma-3 h-7 text-xs font-ui text-stone hover:text-sumi transition-colors duration-base ease-settle"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={pending || !body.trim()}
              className="px-ma-3 h-7 text-xs font-ui font-semibold bg-ai text-kinu rounded transition-colors duration-base ease-settle hover:bg-ai-deep disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Saving…' : 'Save note'}
            </button>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-ma-2 text-xs text-beni">{error}</p>
      )}
    </div>
  );
}

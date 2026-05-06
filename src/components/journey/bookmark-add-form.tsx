'use client';
import { useState, useTransition } from 'react';
import { addBookmark } from '@/lib/journey/actions';
import { type Phase } from '@/lib/journey/types';
import { phaseToUserLabel } from '@/lib/journey/phase-mapping';

const PHASE_OPTIONS: Phase[] = ['1_decision', '3_area', '4_shortlist', '5_due_diligence', '6_offer', '7_pre_close'];

export function BookmarkAddForm() {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<Phase | ''>('');
  const [note, setNote] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await addBookmark({
        url,
        phase: phase || undefined,
        userNote: note || undefined,
      });
      if ('success' in result) {
        setUrl(''); setPhase(''); setNote('');
      } else if (result.error === 'rate_limited') {
        setError("You've added a lot of bookmarks recently. Slow down a moment.");
      } else if (result.error === 'invalid_input') {
        setError('That URL doesn\'t look right. Make sure it starts with https://');
      } else {
        setError('Could not save bookmark.');
      }
    });
  };

  return (
    <div className="bg-kinu rounded-lg p-ma-4 shadow-card">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-ma-3 mb-ma-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL (https only)"
          className="bg-shoji rounded-md focus:outline-none focus:ring-2 focus:ring-ai/30 px-ma-3 py-ma-2 text-sm placeholder:text-ash"
        />
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value as Phase | '')}
          className="bg-shoji rounded-md focus:outline-none focus:ring-2 focus:ring-ai/30 px-ma-3 py-ma-2 text-sm"
        >
          <option value="">Phase (optional)</option>
          {PHASE_OPTIONS.map((p) => (
            <option key={p} value={p}>{phaseToUserLabel(p)}</option>
          ))}
        </select>
        <button
          onClick={submit}
          disabled={pending || !url}
          className="text-sm font-semibold bg-ai text-kinu px-ma-4 py-ma-2 rounded-md hover:bg-ai-deep disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="One-line note (optional)"
        maxLength={500}
        className="w-full bg-shoji rounded-md focus:outline-none focus:ring-2 focus:ring-ai/30 px-ma-3 py-ma-2 text-sm placeholder:text-ash"
      />
      {error && <p className="text-sm text-beni mt-ma-2">{error}</p>}
    </div>
  );
}

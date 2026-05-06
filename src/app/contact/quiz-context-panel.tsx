'use client';

import type { QuizContextSnapshot } from '@/lib/validations/contact';

interface QuizContextPanelProps {
  snapshot: QuizContextSnapshot;
  areaName?: string | null;
  onClear: () => void;
}

interface FieldRow {
  label: string;
  value: string;
}

function buildRows(snapshot: QuizContextSnapshot, areaName?: string | null): FieldRow[] {
  const rows: FieldRow[] = [];
  if (areaName) rows.push({ label: 'Enquiring about', value: areaName });
  if (snapshot.purpose) rows.push({ label: 'Purpose', value: snapshot.purpose });
  if (snapshot.skiSeason) rows.push({ label: 'Ski season', value: snapshot.skiSeason });
  if (snapshot.familyComposition) {
    rows.push({ label: 'Who will use it', value: snapshot.familyComposition });
  }
  if (snapshot.propertyTypes && snapshot.propertyTypes.length > 0) {
    rows.push({ label: 'Property type', value: snapshot.propertyTypes.join(', ') });
  }
  if (snapshot.condition) rows.push({ label: 'Condition', value: snapshot.condition });
  if (snapshot.budget) rows.push({ label: 'Budget', value: snapshot.budget });
  if (snapshot.priority) rows.push({ label: 'Priority', value: snapshot.priority });
  return rows;
}

export function QuizContextPanel({ snapshot, areaName, onClear }: QuizContextPanelProps) {
  const rows = buildRows(snapshot, areaName);
  if (rows.length === 0) return null;

  return (
    <div className="mb-ma-8 rounded-lg border border-ai/30 bg-ai/5 px-ma-6 py-ma-6">
      <div className="mb-ma-3 flex items-baseline justify-between gap-ma-4">
        <p className="label-overline text-ai-deep">Pre-filled from your quiz</p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-stone underline transition-colors hover:text-sumi"
        >
          Clear pre-filled answers
        </button>
      </div>
      <dl className="space-y-ma-2 text-sm text-sumi-light">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap gap-x-ma-2">
            <dt className="text-stone">{row.label}:</dt>
            <dd className="text-sumi">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-ma-4 text-xs text-stone">
        These details will be sent with your message so we can give you a faster, more
        relevant response.
      </p>
    </div>
  );
}

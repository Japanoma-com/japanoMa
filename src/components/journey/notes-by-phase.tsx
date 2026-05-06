// src/components/journey/notes-by-phase.tsx
// Phase-grouped notes. Server-loads notes for ALL six visible phases in
// parallel so opening any accordion shows real content immediately. The
// user's current journey phase auto-expands; "+ Add note" lives in every
// phase so users can capture thoughts about earlier or later steps too.
import { getNotesByPhase, getNoteCounts } from '@/lib/journey/queries';
import { NoteCard } from './note-card';
import { NotesEditor } from './notes-editor';
import { phaseToUserLabel } from '@/lib/journey/phase-mapping';
import { PhaseAccordion } from './phase-accordion';
import type { Phase, JourneyState } from '@/lib/journey/types';

const VISIBLE_PHASES: Phase[] = [
  '1_decision', '3_area', '4_shortlist',
  '5_due_diligence', '6_offer', '7_pre_close',
];

export async function NotesByPhase({
  userId, currentPhase,
}: { userId: string; currentPhase: JourneyState['phase'] }) {
  const currentPhaseInVisible = VISIBLE_PHASES.includes(currentPhase as Phase)
    ? (currentPhase as Phase)
    : null;

  // Load counts and per-phase notes in parallel. Each query hits a
  // (user_id, phase) composite index so total cost is low and
  // predictable — six small reads beats one large fetch + client filter.
  const [counts, ...notesByPhase] = await Promise.all([
    getNoteCounts(userId),
    ...VISIBLE_PHASES.map((p) => getNotesByPhase(userId, p, 10)),
  ]);

  return (
    <section className="mb-ma-16">
      <p className="label-overline text-stone mb-ma-2">Notes</p>
      <h2 className="font-editorial text-2xl text-sumi leading-tight mb-ma-2">
        Your thoughts, by step
      </h2>
      <p className="text-sm text-sumi-light leading-relaxed mb-ma-6 max-w-md">
        Capture decisions, questions, and what you&apos;re learning. Each
        step has its own scratchpad. Markdown supported.
      </p>

      <div className="space-y-ma-2">
        {VISIBLE_PHASES.map((p, i) => {
          const notes = notesByPhase[i];
          const count = counts[p] ?? 0;
          const label = phaseToUserLabel(p);
          const isCurrent = p === currentPhaseInVisible;

          return (
            <PhaseAccordion
              key={p}
              label={label}
              count={count}
              defaultOpen={isCurrent}
              actions={<NotesEditor phase={p} />}
            >
              {notes.length === 0 ? (
                <p className="text-sm text-stone py-ma-2">
                  {isCurrent
                    ? `Nothing yet for ${label}. Capture what you’re learning — what to verify next, who to call, what tradeoffs you noticed.`
                    : `No notes yet for ${label}. Use “+ Add note” to start.`}
                </p>
              ) : (
                <div className="space-y-ma-2">
                  {notes.map((n) => <NoteCard key={n.id} note={n} />)}
                </div>
              )}
            </PhaseAccordion>
          );
        })}
      </div>
    </section>
  );
}

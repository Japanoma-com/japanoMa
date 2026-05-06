// src/lib/journey/signals.ts
import 'server-only';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { inferNextPhase } from './inference';
import { SIGNAL_TYPES, type SignalType, type Phase } from './types';
import type { Json } from '@/lib/supabase/database.types';

const captureSchema = z.object({
  // zod v4 requires a literal tuple shape; spread the const array.
  signalType: z.enum([...SIGNAL_TYPES] as [SignalType, ...SignalType[]]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const RECENT_OVERRIDE_WINDOW_MS = 60_000;

/**
 * Server-only signal capture.
 * - Always logs the signal (audit trail).
 * - Advances phase only if the signal would move forward.
 * - Respects override: if user overrode within last 60s, don't auto-advance.
 */
export async function captureSignal(
  userId: string,
  input: { signalType: SignalType; metadata?: Record<string, unknown> }
): Promise<void> {
  const { signalType, metadata } = captureSchema.parse(input);
  const sb = createServiceClient();

  const { data: state } = await sb
    .from('user_journey_state')
    .select('phase, phase_set_via, phase_overridden_at')
    .eq('user_id', userId)
    .maybeSingle();

  const phaseBefore = (state?.phase ?? '0_trigger') as Phase;
  const phaseAfter = inferNextPhase(phaseBefore, signalType);

  await sb.from('journey_signals').insert({
    user_id: userId,
    signal_type: signalType,
    phase_before: phaseBefore,
    phase_after: phaseAfter,
    metadata: metadata as Json,
  });

  const recentlyOverridden =
    state?.phase_set_via === 'override' &&
    state?.phase_overridden_at &&
    Date.now() - new Date(state.phase_overridden_at).getTime() < RECENT_OVERRIDE_WINDOW_MS;

  if (phaseAfter !== phaseBefore && !recentlyOverridden) {
    await sb.from('user_journey_state').upsert({
      user_id: userId,
      phase: phaseAfter,
      phase_set_via: 'inference',
    });
    revalidateTag(`journey:${userId}`);
  }
}

export { SIGNAL_TYPES };

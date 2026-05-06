// src/lib/journey/queries.ts
import 'server-only';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { phaseToUserLabel, phaseToStepNumber } from './phase-mapping';
import { getNextHint } from './next-hints';
import type { JourneyState, Phase, BuyerType } from './types';

// fetchJourneyState uses the SERVICE client (no cookies) so it can run
// safely inside unstable_cache. Next.js 15 forbids accessing dynamic
// per-request data (cookies/headers) inside cached functions. We filter
// by user_id explicitly and the caller has already authenticated, so
// bypassing RLS here is safe.
async function fetchJourneyState(userId: string): Promise<JourneyState> {
  const sb = createServiceClient();
  const { data } = await sb
    .from('user_journey_state')
    .select('phase, buyer_type, phase_set_via, phase_overridden_at')
    .eq('user_id', userId)
    .maybeSingle();

  const phase = (data?.phase ?? '0_trigger') as Phase;
  return {
    phase,
    userLabel: phaseToUserLabel(phase),
    stepNumber: phaseToStepNumber(phase),
    buyerType: (data?.buyer_type ?? null) as BuyerType | null,
    isOverridden: data?.phase_set_via === 'override',
    phaseOverriddenAt: data?.phase_overridden_at ?? null,
    nextHint: getNextHint(phase),
  };
}

export async function getJourneyState(userId: string): Promise<JourneyState> {
  const cached = unstable_cache(
    () => fetchJourneyState(userId),
    [`journey-state-${userId}`],
    { tags: [`journey:${userId}`, 'journey'], revalidate: 3600 }
  );
  return cached();
}

export const ANONYMOUS_INITIAL_STATE: JourneyState = {
  phase: '0_trigger',
  userLabel: 'Decide First',
  stepNumber: 1,
  buyerType: null,
  isOverridden: false,
  phaseOverriddenAt: null,
  nextHint: 'Take the area quiz',
};

// =========================================
// Notes
// =========================================

export type Note = {
  id: string;
  phase: Phase;
  body: string;
  pinned: boolean;
  linkedPropertySlugs: string[];
  createdAt: string;
  updatedAt: string;
};

export async function getNotesByPhase(userId: string, phase: Phase, limit = 10): Promise<Note[]> {
  const sb = await createClient();
  const { data } = await sb
    .from('journey_notes')
    .select('id, phase, body, pinned, linked_property_slugs, created_at, updated_at')
    .eq('user_id', userId)
    .eq('phase', phase)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  type Row = {
    id: string; phase: string; body: string; pinned: boolean;
    linked_property_slugs: string[] | null; created_at: string; updated_at: string;
  };

  return (data as Row[] | null ?? []).map((row) => ({
    id: row.id,
    phase: row.phase as Phase,
    body: row.body,
    pinned: row.pinned,
    linkedPropertySlugs: row.linked_property_slugs ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getNoteCounts(userId: string): Promise<Record<string, number>> {
  const sb = await createClient();
  const { data } = await sb
    .from('journey_notes')
    .select('phase')
    .eq('user_id', userId);

  const counts: Record<string, number> = {};
  for (const row of (data as { phase: string }[] | null ?? [])) {
    counts[row.phase] = (counts[row.phase] ?? 0) + 1;
  }
  return counts;
}

// src/app/api/journey/state/route.ts
// GET — returns the current user's JourneyState (or anonymous default).
// Used by useJourneyState() client hook for live updates after an override.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getJourneyState, ANONYMOUS_INITIAL_STATE } from '@/lib/journey/queries';

export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json(ANONYMOUS_INITIAL_STATE);
  const state = await getJourneyState(user.id);
  return NextResponse.json(state);
}

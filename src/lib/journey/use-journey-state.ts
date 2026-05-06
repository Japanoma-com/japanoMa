// src/lib/journey/use-journey-state.ts
'use client';
import useSWR from 'swr';
import type { JourneyState } from './types';

const fetcher = async (url: string): Promise<JourneyState> => {
  const res = await fetch(url); // fetch-allow: same-origin /api/journey/state
  if (!res.ok) throw new Error('Failed to fetch journey state');
  return res.json();
};

export function useJourneyState() {
  const { data, mutate, isLoading, error } = useSWR<JourneyState>(
    '/api/journey/state',
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 5000 }
  );
  return { state: data, refresh: mutate, isLoading, error };
}

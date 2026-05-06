'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const InterestHashContext = createContext<string | null>(null);

export function useInterestHash(): string | null {
  return useContext(InterestHashContext);
}

/**
 * Reads the initial #interest=<slug> URL hash on mount, exposes it via
 * context for one render cycle, then clears it via history.replaceState
 * so a page refresh does not retrigger the modal.
 */
export function InterestHashProvider({ children }: { children: React.ReactNode }) {
  const [hashSlug, setHashSlug] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    const match = hash.match(/^#interest=([a-z0-9-]+)$/);
    if (match) {
      setHashSlug(match[1]);
      // Clear the hash so a refresh does not re-fire
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <InterestHashContext.Provider value={hashSlug}>{children}</InterestHashContext.Provider>
  );
}

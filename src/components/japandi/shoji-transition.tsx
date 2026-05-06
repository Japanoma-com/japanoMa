'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface ShojiTransitionProps {
  children: ReactNode;
  /** Unique key to trigger transition on route change */
  transitionKey: string;
  /** Duration in ms */
  duration?: number;
}

/**
 * Shoji screen page transition — a vertical divide line slides across
 * as content fades, evoking sliding shoji panels in a Japanese interior.
 *
 * Tier 2 motion: respects prefers-reduced-motion.
 */
export function ShojiTransition({
  children,
  transitionKey,
  duration = 400,
}: ShojiTransitionProps) {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [displayKey, setDisplayKey] = useState(transitionKey);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (transitionKey === displayKey) return;

    if (reducedMotion) {
      setDisplayKey(transitionKey);
      setDisplayChildren(children);
      return;
    }

    // Start exit
    setState('exit');

    const exitTimer = setTimeout(() => {
      setDisplayKey(transitionKey);
      setDisplayChildren(children);
      setState('enter');
    }, duration / 2);

    const enterTimer = setTimeout(() => {
      setState('idle');
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(enterTimer);
    };
  }, [transitionKey, displayKey, children, duration, reducedMotion]);

  // Update children when key matches (initial render + after transition)
  useEffect(() => {
    if (transitionKey === displayKey && state === 'idle') {
      setDisplayChildren(children);
    }
  }, [children, transitionKey, displayKey, state]);

  const halfDuration = duration / 2;

  return (
    <div className="shoji-transition-wrapper relative overflow-hidden">
      {/* Vertical divide line */}
      <div
        className="shoji-divide-line pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-border"
        style={{
          transition: `left ${halfDuration}ms var(--ease-settle)`,
          left: state === 'exit' ? '100%' : state === 'enter' ? '0%' : '-1px',
          opacity: state === 'idle' ? 0 : 1,
        }}
      />
      {/* Content */}
      <div
        style={{
          transition: `opacity ${halfDuration}ms var(--ease-settle)`,
          opacity: state === 'exit' ? 0 : 1,
        }}
      >
        {displayChildren}
      </div>
    </div>
  );
}

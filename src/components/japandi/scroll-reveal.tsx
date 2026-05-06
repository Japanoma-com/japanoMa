'use client';

import { useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { observeReveal } from '@/lib/motion/scroll-reveal';

interface ScrollRevealProps {
  children: ReactNode;
  /** Fixed delay in ms */
  delay?: number;
  /** Stagger index — effective delay becomes (delay ?? 0) + index * 80ms, per Ma Space v4 Tier 1 spec */
  index?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  delay,
  index,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return observeReveal(ref.current);
  }, []);

  const computedDelay = (delay ?? 0) + (index ?? 0) * 80;

  const style: CSSProperties | undefined =
    computedDelay > 0
      ? ({ '--reveal-delay': `${computedDelay}ms` } as CSSProperties)
      : undefined;

  return (
    <div ref={ref} className={`scroll-reveal ${className}`} style={style}>
      {children}
    </div>
  );
}

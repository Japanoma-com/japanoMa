'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScoreCounterOptions {
  target: number;
  duration?: number;
  disabled?: boolean;
}

export function useScoreCounter({
  target,
  duration = 800,
  disabled = false,
}: UseScoreCounterOptions): number {
  const [value, setValue] = useState(disabled ? target : 0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (disabled) {
      setValue(target);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => {
      startTime.current = null;
    };
  }, [target, duration, disabled]);

  return value;
}

'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RedFlagPanelProps {
  title: string;
  description: string;
  action?: string;
  severity?: 'error' | 'warning';
  className?: string;
}

const severityStyles = {
  error: {
    border: 'border-l-beni',
    indicator: 'text-beni',
  },
  warning: {
    border: 'border-l-kohaku',
    indicator: 'text-kohaku',
  },
};

export function RedFlagPanel({
  title,
  description,
  action,
  severity = 'error',
  className,
}: RedFlagPanelProps) {
  const styles = severityStyles[severity];
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (!ref.current || fired.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !fired.current) {
          fired.current = true;
          // D2L journey: viewing a red-flag panel advances to phase 5_due_diligence
          fetch('/api/journey/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signalType: 'red_flag_panel_viewed' }),
          }).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'bg-shoji border-l-2 rounded-lg p-ma-6',
        styles.border,
        className
      )}
    >
      <div className="flex items-center gap-ma-2 mb-ma-4">
        <span className={cn('inline-block w-2 h-2 rounded-full bg-current', styles.indicator)} aria-hidden="true" />
        <h3 className={cn('font-ui font-semibold text-base', styles.indicator)}>
          {title}
        </h3>
      </div>
      <p className="text-sm text-sumi-light leading-relaxed">
        {description}
      </p>
      {action && (
        <p className="text-sm text-sumi-light leading-relaxed mt-ma-4">
          {action}
        </p>
      )}
    </div>
  );
}

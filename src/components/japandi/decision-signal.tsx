'use client';

import { cn } from '@/lib/utils';
import { useScoreCounter } from '@/lib/motion/score-animate';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

type ScoreValue = number | string;

interface DecisionSignalProps {
  score: ScoreValue;
  label: string;
  context: string;
  className?: string;
}

function getScoreColor(score: ScoreValue): string {
  if (typeof score === 'string') return 'var(--ai)';
  if (score >= 70) return 'var(--matsu)';
  if (score >= 40) return 'var(--kohaku)';
  return 'var(--beni)';
}

export function DecisionSignal({ score, label, context, className }: DecisionSignalProps) {
  const reducedMotion = useReducedMotion();
  const isNumeric = typeof score === 'number';
  const animatedValue = useScoreCounter({
    target: isNumeric ? score : 0,
    disabled: reducedMotion || !isNumeric,
  });

  const displayValue = isNumeric ? animatedValue : score;

  return (
    <div
      className={cn(
        'bg-shoji shadow-card rounded-xl p-ma-8 text-center',
        className
      )}
    >
      <div
        className="score-display mx-auto mb-ma-4"
        style={{ color: getScoreColor(score) }}
      >
        {displayValue}
      </div>
      <span className="label-overline block mb-ma-2">DECISION SIGNAL</span>
      <h3 className="text-sumi font-ui font-bold text-[17px] mb-ma-2">
        {label}
      </h3>
      {context && (
        <p className="caption">{context}</p>
      )}
    </div>
  );
}

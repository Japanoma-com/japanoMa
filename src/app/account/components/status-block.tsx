import { cn } from '@/lib/utils';

type Props = {
  quizComplete: boolean;
  recommendedCount: number;
  interestCount: number;
  savesCount: number;
};

function FactRow({
  label,
  value,
  valueClass,
  /**
   * When set, the value span gets a key prop so React remounts it on every
   * change — combined with the .animate-fade-up class this gives a smooth
   * fade-up transition each time the number changes (e.g. interest count
   * going from 0 → 1 after Express Interest fires router.refresh()).
   */
  animateOnChange = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  animateOnChange?: boolean;
}) {
  return (
    <div className="flex items-center justify-between h-7">
      <span className="text-[11px] text-stone">{label}</span>
      <span
        key={animateOnChange ? value : undefined}
        className={cn(
          'text-[13px] tabular-nums',
          valueClass ?? 'text-sumi',
          animateOnChange && 'animate-fade-up'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function StatusBlock({
  quizComplete,
  recommendedCount,
  interestCount,
  savesCount,
}: Props) {
  return (
    <div>
      <p className="label-overline text-stone mb-ma-3">At a glance</p>
      <div className="space-y-ma-2">
        <FactRow
          label="Quiz"
          value={quizComplete ? 'Complete' : 'Not taken'}
          valueClass={quizComplete ? 'text-matsu' : 'text-stone'}
        />
        {!quizComplete && (
          <a
            href="/quiz"
            className="block -mt-1 text-[10px] text-ai underline underline-offset-[3px]"
          >
            Take the quiz →
          </a>
        )}
        <FactRow
          label="Recommended"
          value={`${recommendedCount} ${recommendedCount === 1 ? 'area' : 'areas'}`}
        />
        <FactRow
          label="Interests"
          value={`${interestCount} recorded`}
          valueClass={interestCount > 0 ? 'text-ai' : 'text-stone'}
          animateOnChange
        />
        <FactRow
          label="Saves"
          value={`${savesCount} ${savesCount === 1 ? 'item' : 'items'}`}
          animateOnChange
        />
      </div>
    </div>
  );
}

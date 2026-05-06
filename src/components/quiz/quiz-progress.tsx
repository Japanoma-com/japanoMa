import { TOTAL_STEPS } from '@/lib/quiz/questions';

/**
 * Quiz progress rail. Single hairline track with a smoothly-animated
 * indigo fill. The previous segmented bar read as 7 disconnected blips;
 * a continuous rail reads as actual journey progress and pairs better
 * with the editorial hero above.
 */
export function QuizProgress({ currentStep }: { currentStep: number }) {
  // Progress is computed across step boundaries: arriving at step 1
  // (index 0) shows 1/N filled; arriving at the final step shows N/N
  // (full). Avoids a 0% rest state on landing that suggests "nothing
  // started" when the user has actually begun the quiz.
  const pct = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <div
      className="relative h-[3px] w-full bg-border/60 rounded-full overflow-hidden"
      role="progressbar"
      aria-label={`Quiz progress — step ${currentStep + 1} of ${TOTAL_STEPS}`}
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ai/85 to-ai transition-[width] duration-slow ease-settle"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

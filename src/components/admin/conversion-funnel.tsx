/**
 * Editorial conversion funnel — proportional bars per step with
 * accessible per-step conversion % annotations. No chart library.
 *
 * Layout is responsive: label + count stack above the bar on mobile,
 * sit alongside on ≥sm. The conversion % is a chip sitting on the
 * bar with its own opaque background — robust to whatever shade the
 * bar ends up being, so contrast always passes AA.
 *
 * Palette uses AA-safe indigo shades (all ≥3:1 on #1A1816 even at
 * the light end) so the fallback text color (sumi) on the remaining
 * bar track stays legible too.
 */

type Step = { label: string; value: number };

// All four shades are dark enough for 4.5:1 against #FFFFFF text at
// font-size 12px+. Progressively lighter to show conversion decay.
const PALETTE = ['#2C4562', '#3D5A7A', '#4E6D8F', '#5F80A4'];

export function ConversionFunnel({
  steps,
  title,
}: {
  steps: Step[];
  title?: string;
}) {
  if (steps.length === 0) return null;
  const top = Math.max(steps[0].value, 1);

  return (
    <div className="bg-shoji border border-border rounded-lg p-ma-6 h-full overflow-hidden">
      {title && <p className="label-overline text-stone mb-ma-4">{title}</p>}

      <div className="space-y-ma-3">
        {steps.map((step, i) => {
          const pct = (step.value / top) * 100;
          const rateOfPrev =
            i === 0 || steps[i - 1].value === 0
              ? null
              : (step.value / steps[i - 1].value) * 100;
          return (
            <div
              key={step.label}
              className="flex flex-col sm:flex-row sm:items-center gap-ma-1 sm:gap-ma-3 min-w-0"
            >
              <div className="w-full sm:w-36 flex sm:block items-baseline gap-ma-2 flex-shrink-0">
                <p className="text-xs text-stone">{step.label}</p>
                <p className="text-xl font-editorial text-sumi tabular-nums leading-none">
                  {step.value.toLocaleString('en-AU')}
                </p>
              </div>

              <div className="flex-1 min-w-0 h-10 relative bg-washi rounded-md overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-md transition-all duration-slow ease-settle"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: PALETTE[Math.min(i, PALETTE.length - 1)],
                  }}
                />
                {rateOfPrev !== null && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] tabular-nums font-semibold bg-kinu/95 text-sumi px-1.5 py-0.5 rounded-sm">
                    {rateOfPrev.toFixed(0)}% of prev
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

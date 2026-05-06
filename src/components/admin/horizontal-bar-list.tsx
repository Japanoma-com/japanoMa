import type { ReactNode } from 'react';

/**
 * Dense horizontal-bar ranking used for top articles, top areas, top
 * filter combos. Each row: rank, label (optionally a link), inline
 * bar proportional to the max value, trailing numeric.
 *
 * Pure server-component — no JS, no recharts, just divs + background.
 */

type Item = {
  key: string;
  label: ReactNode;
  value: number;
  sub?: ReactNode;
  href?: string;
};

export function HorizontalBarList({
  items,
  emptyMessage,
  accent = '#3D5A7A',
  formatValue = (v) => v.toLocaleString('en-AU'),
}: {
  items: Item[];
  emptyMessage: string;
  accent?: string;
  formatValue?: (v: number) => string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-stone">{emptyMessage}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ol className="space-y-ma-2 w-full min-w-0">
      {items.map((item, i) => {
        const pct = (item.value / max) * 100;
        const labelEl = (
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="text-sumi text-sm truncate">{item.label}</div>
            {item.sub && (
              <div className="text-stone text-xs truncate">{item.sub}</div>
            )}
          </div>
        );
        return (
          <li key={item.key} className="relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-sm"
              style={{
                width: `${pct}%`,
                background: accent,
                opacity: 0.1,
              }}
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-ma-3 px-ma-2 py-ma-2 min-w-0">
              <span className="text-stone tabular-nums text-xs w-5 flex-shrink-0">
                {i + 1}
              </span>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 hover:text-ai overflow-hidden"
                >
                  {labelEl}
                </a>
              ) : (
                labelEl
              )}
              <span className="text-sumi tabular-nums text-xs flex-shrink-0">
                {formatValue(item.value)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

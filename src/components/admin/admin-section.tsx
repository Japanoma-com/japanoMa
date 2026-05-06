import { Suspense, type ReactNode } from 'react';
import { DateRangeControls } from './date-range-controls';
import { formatRangeLabel } from '@/lib/admin/range';
import type { DateRange } from '@/lib/admin/queries';

/**
 * Section header used at the top of every admin page.
 * Standardises overline + title + subtitle + range label + controls so
 * page files can focus on data, not chrome.
 */
export function AdminSection({
  overline,
  title,
  subtitle,
  range,
  rangeControls = true,
  actions,
}: {
  overline: string;
  title: string;
  subtitle?: ReactNode;
  range?: DateRange;
  rangeControls?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-ma-6 flex-wrap mb-ma-12">
      <div>
        <p className="label-overline text-ai mb-ma-2">{overline}</p>
        <h1 className="text-3xl font-editorial text-sumi">{title}</h1>
        {(subtitle || range) && (
          <p className="text-sm text-stone mt-ma-2">
            {subtitle ? <>{subtitle} </> : null}
            {range ? formatRangeLabel(range) : null}
          </p>
        )}
      </div>
      <div className="flex items-center gap-ma-3 flex-wrap">
        {rangeControls && (
          <Suspense fallback={null}>
            <DateRangeControls />
          </Suspense>
        )}
        {actions}
      </div>
    </div>
  );
}

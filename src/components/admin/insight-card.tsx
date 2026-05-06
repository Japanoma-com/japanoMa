import type { ReactNode } from 'react';

/**
 * Shell for a single visualization card on the Insights page.
 * Keeps header + optional deep-link consistent across all cards.
 */
export function InsightCard({
  overline,
  title,
  href,
  hrefLabel = 'Detail →',
  children,
  className = '',
}: {
  overline: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-shoji border border-border rounded-lg p-ma-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-ma-3 mb-ma-6">
        <div>
          <p className="label-overline text-stone mb-ma-1">{overline}</p>
          <h2 className="text-xl font-editorial text-sumi">{title}</h2>
        </div>
        {href && (
          <a
            href={href}
            className="text-xs text-ai hover:text-ai-deep underline underline-offset-2 whitespace-nowrap"
          >
            {hrefLabel}
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

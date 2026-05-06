/**
 * Per-section skeleton placeholders used as Suspense fallbacks on the
 * admin pages. Each matches the approximate shape of the data card it
 * stands in for so the layout doesn't jump when content streams in.
 *
 * Kept intentionally minimal — one shared pulse + a few sizes.
 */

export function CardSkeleton({ className = 'h-64' }: { className?: string }) {
  return (
    <div
      className={`bg-shoji border border-border rounded-lg animate-pulse ${className}`}
    />
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 gap-ma-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-shoji border border-border rounded-lg h-28 animate-pulse"
        />
      ))}
    </div>
  );
}

export function HeroRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-ma-6">
      <div className="lg:col-span-3 bg-shoji border border-border rounded-lg h-72 animate-pulse" />
      <div className="lg:col-span-2">
        <StatGridSkeleton />
      </div>
    </div>
  );
}

export function ThreeCardRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-ma-6">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function TwoCardRowSkeleton({
  leftSpan = 2,
  rightSpan = 1,
}: {
  leftSpan?: number;
  rightSpan?: number;
}) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-${leftSpan + rightSpan} gap-ma-6`}>
      <div className={`lg:col-span-${leftSpan}`}>
        <CardSkeleton />
      </div>
      <div className={`lg:col-span-${rightSpan}`}>
        <CardSkeleton />
      </div>
    </div>
  );
}

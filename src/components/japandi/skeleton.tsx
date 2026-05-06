import { cn } from '@/lib/utils';

interface MaSkeletonProps {
  className?: string;
  /** Width as Tailwind class or inline */
  width?: string;
  /** Height as Tailwind class */
  height?: string;
}

/**
 * Ma Skeleton — a breathing placeholder block.
 * Warm washi pulse, not cold grey. Respects reduced motion.
 */
export function MaSkeleton({ className, width, height = 'h-4' }: MaSkeletonProps) {
  return (
    <div
      className={cn(
        'ma-skeleton rounded-lg',
        height,
        width,
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for a heading line.
 */
export function SkeletonHeading({ level = 1 }: { level?: 1 | 2 | 3 }) {
  const heights = { 1: 'h-10', 2: 'h-8', 3: 'h-5' };
  const widths = { 1: 'w-3/4', 2: 'w-2/3', 3: 'w-1/2' };
  return <MaSkeleton height={heights[level]} width={widths[level]} />;
}

/**
 * Skeleton for body text lines.
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <MaSkeleton
          key={i}
          height="h-3.5"
          width={i === lines - 1 ? 'w-4/5' : 'w-full'}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for an overline label.
 */
export function SkeletonOverline() {
  return <MaSkeleton height="h-2.5" width="w-24" />;
}

/**
 * Skeleton for a city row in the areas list.
 */
export function SkeletonAreaRow() {
  return (
    <div className="flex items-baseline justify-between border-b border-bamboo/50 py-ma-4">
      <div className="flex items-baseline gap-ma-3">
        <MaSkeleton height="h-4" width="w-32" />
        <MaSkeleton height="h-3" width="w-16" className="opacity-50" />
      </div>
      <MaSkeleton height="h-3" width="w-20" className="opacity-50" />
    </div>
  );
}

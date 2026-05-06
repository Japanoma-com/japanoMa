import { LogoMark } from './logo-mark';

/**
 * Mark + "JapanoMa" wordmark together. The wordmark is rendered in
 * Shippori Mincho (the site's editorial serif) so it stays editable,
 * accessible text rather than a locked raster glyph. Both mark and
 * wordmark inherit `currentColor` so the lockup adapts to any surface
 * (washi, sumi, ai, matsu etc.) without separate asset variants.
 */

type LockupOrientation = 'horizontal' | 'stacked';
type LockupSize = 'sm' | 'md' | 'lg' | 'xl';

interface LogoLockupProps {
  orientation?: LockupOrientation;
  size?: LockupSize;
  wordmark?: boolean;
  className?: string;
  /**
   * Used as the accessible name when the lockup is the only link text.
   * Defaults to "JapanoMa — home".
   */
  title?: string;
}

const SIZE: Record<
  LockupSize,
  { mark: string; word: string; gap: string; gapStacked: string }
> = {
  sm: { mark: 'h-5', word: 'text-base', gap: 'gap-2', gapStacked: 'gap-1' },
  md: { mark: 'h-7', word: 'text-xl', gap: 'gap-2.5', gapStacked: 'gap-1.5' },
  lg: { mark: 'h-10', word: 'text-2xl', gap: 'gap-3', gapStacked: 'gap-2' },
  xl: { mark: 'h-16', word: 'text-4xl', gap: 'gap-4', gapStacked: 'gap-3' },
};

export function LogoLockup({
  orientation = 'horizontal',
  size = 'md',
  wordmark = true,
  className,
  title,
}: LogoLockupProps) {
  const s = SIZE[size];
  const directionClass = orientation === 'stacked' ? 'flex-col' : 'flex-row items-center';
  const gap = orientation === 'stacked' ? s.gapStacked : s.gap;

  return (
    <span
      className={`inline-flex ${directionClass} ${gap} ${className ?? ''}`}
      aria-label={title ?? 'JapanoMa'}
    >
      <LogoMark className={`${s.mark} w-auto shrink-0`} aria-hidden />
      {wordmark && (
        <span
          className={`font-editorial ${s.word} leading-none tracking-[-0.01em]`}
          aria-hidden
        >
          JapanoMa
        </span>
      )}
    </span>
  );
}

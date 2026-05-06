'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface KenBurnsHeroProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  height?: 'default' | 'tall' | 'full';
  overlay?: 'light' | 'medium' | 'heavy';
  position?: 'center' | 'bottom';
}

const heightMap = {
  default: 'h-[65vh]',
  tall: 'h-[80vh]',
  full: 'h-screen',
};

const overlayMap = {
  light: 'from-sumi/30 via-sumi/10 to-transparent',
  medium: 'from-sumi/50 via-sumi/15 to-transparent',
  heavy: 'from-sumi/70 via-sumi/25 to-sumi/5',
};

export function KenBurnsHero({
  src,
  alt,
  children,
  className,
  height = 'default',
  overlay = 'medium',
  position = 'bottom',
}: KenBurnsHeroProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={cn('relative w-full overflow-hidden', heightMap[height], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover',
          !reducedMotion && 'animate-ken-burns'
        )}
        style={{ filter: 'saturate(0.88) brightness(1.02) sepia(0.05)' }}
        sizes="100vw"
        priority
      />
      {/* Gradient overlay */}
      <div className={cn('absolute inset-0 bg-gradient-to-t', overlayMap[overlay])} />
      {/* Content overlay */}
      {children && (
        <div className={cn(
          'absolute left-0 right-0 px-ma-6',
          position === 'bottom' ? 'bottom-0 pb-ma-16' : 'top-1/2 -translate-y-1/2',
        )}>
          <div className="ma-page">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

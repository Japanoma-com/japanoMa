import { cn } from '@/lib/utils';

interface MaDividerProps {
  /** Size: 'breath' (64px), 'zone' (128px), or custom pixel value */
  size?: 'breath' | 'zone' | number;
  /** Show a visible separator line centered in the space */
  line?: boolean;
}

const sizeMap = {
  breath: 'h-ma-16',
  zone: 'h-ma-32',
};

export function MaDivider({ size = 'zone', line = false }: MaDividerProps) {
  const height = typeof size === 'number' ? undefined : sizeMap[size];
  const style = typeof size === 'number' ? { height: size } : undefined;

  if (!line) {
    return <div className={height} style={style} aria-hidden="true" />;
  }

  return (
    <div
      className={cn('flex items-center', height)}
      style={style}
      aria-hidden="true"
    >
      <div className="w-full max-w-[120px] mx-auto h-px bg-gradient-to-r from-transparent via-bamboo to-transparent" />
    </div>
  );
}

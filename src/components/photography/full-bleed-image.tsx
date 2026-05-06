import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FullBleedImageProps {
  src: string;
  alt: string;
  desaturate?: boolean;
  className?: string;
}

export function FullBleedImage({ src, alt, desaturate = false, className }: FullBleedImageProps) {
  return (
    <div className={cn('relative w-screen -mx-[50vw] left-1/2 right-1/2 h-[65vh]', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover',
          desaturate && 'grayscale'
        )}
        style={{ filter: desaturate ? undefined : 'saturate(0.88) brightness(1.02)' }}
        sizes="100vw"
      />
    </div>
  );
}

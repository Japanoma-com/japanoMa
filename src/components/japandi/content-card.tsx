import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ContentCardProps {
  category: string;
  title: string;
  titleJa?: string;
  description: string;
  href: string;
  className?: string;
}

export function ContentCard({
  category,
  title,
  titleJa,
  description,
  href,
  className,
}: ContentCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'block bg-shoji shadow-card rounded-xl p-ma-6',
        'hover:-translate-y-0.5 hover:shadow-card-hover',
        'transition-all duration-slow ease-settle',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai focus-visible:ring-offset-[3px]',
        className
      )}
    >
      <span className="label-overline block mb-ma-4">{category}</span>
      <h3 className="font-editorial font-normal text-[22px] text-sumi leading-[1.25] mb-ma-2">
        {title}
        {titleJa && (
          <>
            <br />
            <span className="text-stone text-lg">{titleJa}</span>
          </>
        )}
      </h3>
      <p className="text-sm text-sumi-light leading-relaxed">
        {description}
      </p>
    </Link>
  );
}

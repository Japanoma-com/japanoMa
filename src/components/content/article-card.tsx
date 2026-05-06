import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { urlFor } from '@/lib/sanity/image';

type ArticleCardProps = {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  areaTags?: string[];
  featuredImage?: { asset: { _ref: string } };
};

export function ArticleCard({ title, slug, excerpt, publishedAt, areaTags, featuredImage }: ArticleCardProps) {
  const imageUrl = featuredImage
    ? urlFor(featuredImage).width(800).height(500).fit('crop').auto('format').url()
    : null;

  return (
    <Link
      href={`/content/${slug}`}
      className="group flex flex-col rounded-lg bg-shoji shadow-card overflow-hidden transition-all duration-base ease-settle hover:shadow-card-hover hover:-translate-y-px h-full"
    >
      {/* Image */}
      <div className="aspect-[16/10] w-full relative overflow-hidden bg-sumi/[0.04]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-slow ease-settle group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-editorial text-4xl text-sumi/[0.06] select-none" aria-hidden="true">
              {title.charAt(0)}
            </span>
          </div>
        )}
        {/* Tags overlay */}
        {(() => {
          const visibleTags = (areaTags || []).filter((t): t is string => typeof t === 'string' && t.length > 0);
          if (visibleTags.length === 0) return null;
          return (
            <div className="absolute bottom-0 left-0 right-0 p-ma-3 bg-gradient-to-t from-sumi/30 to-transparent">
              <div className="flex gap-ma-1 flex-wrap">
                {visibleTags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[9px] bg-washi/90 backdrop-blur-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-ma-6">
        <h3 className="text-sm font-semibold leading-snug mb-ma-2 group-hover:text-ai-deep transition-colors duration-base ease-settle">
          {title}
        </h3>
        {excerpt && (
          <p className="text-xs text-stone leading-relaxed line-clamp-3 flex-1">{excerpt}</p>
        )}
        {publishedAt && (
          <p className="text-[10px] text-ash mt-ma-4 pt-ma-3 border-t border-border/50">
            {new Date(publishedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </Link>
  );
}

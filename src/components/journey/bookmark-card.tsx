// src/components/journey/bookmark-card.tsx
import Image from 'next/image';
import { phaseToUserLabel } from '@/lib/journey/phase-mapping';
import { DeleteBookmarkButton } from './delete-bookmark-button';
import type { Phase } from '@/lib/journey/types';

export type Bookmark = {
  id: string;
  url: string;
  phase: Phase | null;
  userNote: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  ogSiteName: string | null;
  ogFetchedAt: string | null;
  createdAt: string;
};

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const date = new Date(bookmark.createdAt).toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
  });
  const proxiedImage = bookmark.ogImageUrl
    ? `/api/og-image-proxy?url=${encodeURIComponent(bookmark.ogImageUrl)}`
    : null;
  let host: string;
  try {
    host = new URL(bookmark.url).hostname.replace(/^www\./, '');
  } catch {
    host = bookmark.url;
  }

  return (
    <article className="group relative flex gap-ma-4 bg-kinu rounded-lg overflow-hidden shadow-card transition-[box-shadow,transform] duration-slow ease-settle hover:shadow-[0_8px_24px_rgba(26,24,22,0.08)] hover:-translate-y-[1px]">
      {/* Hero thumbnail — left side, 4:3 ratio, ~140px wide */}
      {proxiedImage ? (
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer ugc"
          className="relative w-[140px] flex-shrink-0 self-stretch bg-washi overflow-hidden"
          aria-label={`Open ${bookmark.ogTitle ?? bookmark.url}`}
        >
          <Image
            src={proxiedImage}
            alt={bookmark.ogTitle ?? 'bookmark preview'}
            fill
            className="object-cover transition-transform duration-slow ease-settle group-hover:scale-105"
            sizes="140px"
          />
        </a>
      ) : (
        <div className="w-[140px] flex-shrink-0 self-stretch bg-shoji flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-ash" aria-hidden>
            <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 22L10 16L14 20L20 14L28 22" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="22" cy="11" r="2" fill="currentColor" />
          </svg>
        </div>
      )}

      <div className="flex-1 py-ma-3 pr-ma-4 min-w-0">
        <div className="flex items-center gap-ma-2 mb-ma-1">
          <span className="text-[10px] font-ui font-semibold text-stone uppercase tracking-wide truncate">
            {bookmark.ogSiteName ?? host}
          </span>
          <span className="text-[10px] text-ash">·</span>
          <time className="text-[10px] text-stone tabular-nums">{date}</time>
          {!bookmark.ogFetchedAt && (
            <span className="text-[10px] text-ash italic">fetching preview…</span>
          )}
        </div>

        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer ugc"
          className="block group/title focus:outline-none focus-visible:ring-2 focus-visible:ring-ai rounded"
        >
          <h3 className="font-editorial text-base text-sumi leading-snug mb-ma-1 line-clamp-2 group-hover/title:text-ai transition-colors duration-base ease-settle">
            {bookmark.ogTitle ?? bookmark.url}
          </h3>
        </a>

        {bookmark.ogDescription && (
          <p className="text-xs text-stone leading-relaxed line-clamp-2 mb-ma-2">
            {bookmark.ogDescription}
          </p>
        )}

        <div className="flex items-center justify-between gap-ma-2 mt-ma-2">
          <div className="flex items-center gap-ma-2 min-w-0">
            {bookmark.phase && (
              <span className="inline-flex items-center px-ma-2 h-5 rounded-full text-[10px] font-ui font-medium text-ai-deep bg-ai/10">
                {phaseToUserLabel(bookmark.phase)}
              </span>
            )}
            {bookmark.userNote && (
              <span className="text-[11px] text-sumi-light italic truncate" title={bookmark.userNote}>
                &ldquo;{bookmark.userNote}&rdquo;
              </span>
            )}
          </div>
          <div className="flex items-center gap-ma-3 flex-shrink-0">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="text-xs font-ui text-ai hover:text-ai-deep transition-colors duration-base ease-settle inline-flex items-center gap-1"
            >
              Open
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M3 3H7V7M7 3L3 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </a>
            <DeleteBookmarkButton id={bookmark.id} />
          </div>
        </div>
      </div>
    </article>
  );
}

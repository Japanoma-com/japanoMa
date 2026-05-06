// src/components/journey/note-card.tsx
import { renderMarkdown } from '@/lib/journey/markdown';
import type { Note } from '@/lib/journey/queries';

export async function NoteCard({ note }: { note: Note }) {
  const html = await renderMarkdown(note.body);
  const date = new Date(note.createdAt).toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group relative bg-kinu rounded-lg p-ma-4 shadow-card transition-[box-shadow,transform] duration-slow ease-settle hover:shadow-[0_8px_24px_rgba(26,24,22,0.08)] hover:-translate-y-[1px]">
      {note.pinned && (
        <div className="absolute -top-2 left-ma-3 inline-flex items-center gap-1 px-ma-2 py-0.5 bg-kohaku/10 rounded-full">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-kohaku" aria-hidden>
            <path d="M5 1V5M5 5L3 7M5 5L7 7M5 5C3.5 5 2 6.5 2 8H8C8 6.5 6.5 5 5 5Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-ui font-semibold text-kohaku uppercase tracking-wide">Pinned</span>
        </div>
      )}

      <div
        className="prose prose-sm max-w-none text-sumi-light leading-relaxed [&_p]:my-1 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_a]:text-ai [&_a:hover]:text-ai-deep"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="flex items-center justify-between gap-ma-3 mt-ma-3 pt-ma-3 border-t border-washi">
        {note.linkedPropertySlugs.length > 0 ? (
          <div className="flex items-center gap-ma-1 flex-wrap">
            {note.linkedPropertySlugs.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center px-ma-2 h-5 rounded text-[10px] font-ui text-stone bg-washi"
              >
                {slug}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
        <time className="text-[11px] text-ash tabular-nums">{date}</time>
      </div>
    </article>
  );
}

// src/components/legal/legal-shell.tsx
// Shared layout for /privacy and /terms. Sticky table-of-contents on
// desktop, version + last-updated header, anchored sections so a
// user can be linked to a specific clause from anywhere (e.g.
// "review section §3 in our privacy policy").
'use client';

import type { ReactNode } from 'react';
import { ScrollReveal } from '@/components/japandi';

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

type Props = {
  overline: string;
  title: string;
  version: string;
  lastUpdated: string;
  /** Plain-language summary shown at the top, before the ToC. */
  intro?: ReactNode;
  /** Render-time notice (e.g. "Awaiting legal review"). Hidden in prod. */
  reviewNotice?: ReactNode;
  sections: LegalSection[];
};

export function LegalShell({
  overline,
  title,
  version,
  lastUpdated,
  intro,
  reviewNotice,
  sections,
}: Props) {
  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="mx-auto max-w-[1080px]">
        <ScrollReveal>
          <p className="label-overline text-stone mb-ma-4">{overline}</p>
          <h1 className="font-editorial text-[40px] sm:text-[52px] leading-[1.05] mb-ma-4">
            {title}
          </h1>
          <p className="text-[12px] text-stone tabular-nums mb-ma-12">
            <span className="font-medium text-sumi">Version {version}</span>
            <span className="mx-ma-2 text-ash" aria-hidden>·</span>
            <span>Last updated {lastUpdated}</span>
          </p>
        </ScrollReveal>

        {reviewNotice && (
          <div className="mb-ma-12 bg-kohaku/10 rounded-md px-ma-4 py-ma-3 border-l-2 border-kohaku">
            <p className="text-[13px] text-sumi leading-relaxed">{reviewNotice}</p>
          </div>
        )}

        {intro && (
          <ScrollReveal delay={100}>
            <div className="text-[15px] text-sumi-light leading-relaxed mb-ma-16 max-w-2xl">
              {intro}
            </div>
          </ScrollReveal>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-ma-12 lg:gap-ma-16 items-start">
          <TableOfContents sections={sections} />
          <article className="min-w-0 max-w-2xl">
            {sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
                style={{
                  marginTop: i === 0 ? 0 : 'var(--space-16)',
                }}
              >
                <h2 className="font-editorial text-[24px] sm:text-[28px] leading-tight text-sumi mb-ma-6">
                  <span className="text-stone tabular-nums mr-ma-3 text-[18px] font-ui font-medium">
                    §{i + 1}
                  </span>
                  {section.title}
                </h2>
                <div className="prose-japanoma text-[15px] text-sumi-light leading-relaxed space-y-ma-4">
                  {section.body}
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}

function TableOfContents({ sections }: { sections: LegalSection[] }) {
  return (
    <aside
      className="lg:sticky lg:top-ma-32 lg:self-start hidden lg:block"
      aria-label="Table of contents"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone mb-ma-4">
        Contents
      </p>
      <ol className="flex flex-col gap-[2px]">
        {sections.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group flex items-baseline gap-ma-2 px-ma-2 py-[6px] text-[12px] leading-snug text-sumi-light hover:text-ai hover:bg-shoji rounded-md transition-colors duration-base ease-settle"
            >
              <span className="tabular-nums text-stone group-hover:text-ai/70 text-[10px] font-medium flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

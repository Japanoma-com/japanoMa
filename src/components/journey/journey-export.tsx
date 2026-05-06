// src/components/journey/journey-export.tsx
'use client';
import { useState, useEffect } from 'react';

export function JourneyExport() {
  const [pdfDisabledUntil, setPdfDisabledUntil] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (pdfDisabledUntil <= Date.now()) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [pdfDisabledUntil]);

  const downloadPdf = async () => {
    const res = await fetch('/api/journey/export/pdf'); // fetch-allow: same-origin export endpoint
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('Retry-After') ?? '60');
      setPdfDisabledUntil(Date.now() + retryAfter * 1000);
      return;
    }
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') ?? 'journey.pdf';
    a.click();
    URL.revokeObjectURL(url);
    setPdfDisabledUntil(Date.now() + 60_000);
  };

  const pdfDisabled = pdfDisabledUntil > now;
  const pdfCountdown = pdfDisabled ? Math.ceil((pdfDisabledUntil - now) / 1000) : 0;

  return (
    <section className="mb-ma-16">
      <p className="label-overline text-stone mb-ma-2">Export</p>
      <h2 className="font-editorial text-2xl text-sumi leading-tight mb-ma-2">
        Take it with you
      </h2>
      <p className="text-sm text-sumi-light leading-relaxed mb-ma-6 max-w-md">
        Your saves, notes, bookmarks, and progress in a single document.
        Useful for sharing with your partner, or just for keeping a record.
      </p>

      <div className="flex flex-wrap gap-ma-2">
        {/* Markdown — the primary export. Portable, machine-readable, default. */}
        <a
          href="/api/journey/export/markdown"
          download
          className="inline-flex items-center gap-ma-2 h-10 px-ma-4 text-sm font-ui font-semibold bg-ai text-kinu rounded-md transition-[background-color,box-shadow,transform] duration-base ease-settle hover:bg-ai-deep hover:shadow-[0_4px_12px_-2px_rgba(61,90,122,0.35)] active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 2V10M7 10L4 7M7 10L10 7M2 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Markdown
        </a>

        {/* PDF — secondary; refined outline button matching Ma Space restraint */}
        <button
          onClick={downloadPdf}
          disabled={pdfDisabled}
          className="inline-flex items-center gap-ma-2 h-10 px-ma-4 text-sm font-ui font-medium text-sumi bg-shoji rounded-md transition-[background-color,box-shadow,transform] duration-base ease-settle hover:bg-kinu hover:shadow-card active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-shoji disabled:hover:shadow-none"
        >
          {pdfDisabled ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7 4V7L9 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span className="tabular-nums">{pdfCountdown}s</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M7 2V10M7 10L4 7M7 10L10 7M2 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              PDF
            </>
          )}
        </button>
      </div>
    </section>
  );
}

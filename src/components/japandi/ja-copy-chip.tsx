// src/components/japandi/ja-copy-chip.tsx
// Click-to-copy chip for Japanese place names. Australian buyers
// often need to paste a prefecture or city's Japanese name into
// partner sites that only search in JA — Yukiyama snow reports,
// the GSI hazard map portal, municipal websites, etc. The chip
// makes that one click instead of select-and-copy gymnastics, and
// surfaces the partner sites as one-tap outbound links right
// underneath so the path is obvious.
'use client';

import {
  useState,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export type OutboundSite = {
  label: string;
  href: string;
  /** Optional title attribute for the external link (tooltip). */
  title?: string;
};

export const DEFAULT_OUTBOUND_SITES: OutboundSite[] = [
  {
    label: 'Hazard Map',
    href: 'https://disaportal.gsi.go.jp/',
    title: 'GSI Hazard Map Portal — paste the copied name into the address search.',
  },
  {
    label: 'Yukiyama',
    href: 'https://yukiyama.com/',
    title: 'Yukiyama — Japanese snow-resort information.',
  },
];

type Size = 'sm' | 'md';

type Props = {
  /** Japanese name to render and copy (e.g. 長野県 or 白馬村). */
  nameJa: string;
  /** Optional ARIA label override; defaults to "Copy <nameJa> to clipboard". */
  ariaLabel?: string;
  /** Outbound search links rendered beneath the chip. Pass [] to hide. */
  outboundSites?: OutboundSite[];
  /** Compact 'sm' for inline use, 'md' for standalone blocks. Default 'sm'. */
  size?: Size;
  /** Adds a small overline above the chip ("Search this name on:"). */
  showLabel?: boolean;
  /** Caller-supplied class on the wrapper. */
  className?: string;
};

export function JaCopyChip({
  nameJa,
  ariaLabel,
  outboundSites = DEFAULT_OUTBOUND_SITES,
  size = 'sm',
  showLabel = true,
  className = '',
}: Props) {
  const [copied, setCopied] = useState(false);
  // Clipboard API is async + can be unavailable in non-secure
  // contexts. The execCommand fallback covers older Safari + the
  // edge cases where navigator.clipboard rejects.
  async function handleCopy(e: ReactMouseEvent | ReactKeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(nameJa);
        ok = true;
      } else {
        const ta = document.createElement('textarea');
        ta.value = nameJa;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      ok = false;
    }
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  const chipBase =
    'group/chip inline-flex items-center gap-ma-2 rounded-full transition-[background-color,box-shadow,color] duration-base ease-settle bg-shoji hover:bg-kinu hover:shadow-card focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(61,90,122,0.18)]';
  const chipSize =
    size === 'md' ? 'h-9 px-ma-3' : 'h-7 px-ma-2';
  const textSize =
    size === 'md' ? 'text-[15px]' : 'text-[13px]';
  const iconSize = size === 'md' ? 14 : 12;

  return (
    <div className={`inline-flex flex-col items-start gap-ma-2 ${className}`}>
      <button
        type="button"
        onClick={handleCopy}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleCopy(e);
        }}
        aria-label={ariaLabel ?? `Copy ${nameJa} to clipboard`}
        title={copied ? 'Copied' : `Copy ${nameJa}`}
        className={`${chipBase} ${chipSize}`}
      >
        <span
          className={`${textSize} text-sumi tabular-nums`}
          style={{ fontFamily: 'var(--font-jp-fallback), var(--font-ui)' }}
        >
          {nameJa}
        </span>
        <span
          aria-hidden
          className={`flex-shrink-0 transition-colors duration-base ease-settle ${
            copied ? 'text-matsu' : 'text-stone group-hover/chip:text-ai'
          }`}
        >
          {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
        </span>
        <span aria-live="polite" className="sr-only">
          {copied ? `Copied ${nameJa} to clipboard` : ''}
        </span>
      </button>

      {outboundSites.length > 0 && (
        <div className="flex flex-wrap items-baseline gap-ma-2">
          {showLabel && (
            <span className="text-[9px] uppercase tracking-[0.14em] text-stone/80 font-medium">
              Search on
            </span>
          )}
          {outboundSites.map((site) => (
            <a
              key={site.href}
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
              title={site.title}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] text-ai hover:text-ai-deep underline underline-offset-[3px] decoration-ai/30 hover:decoration-ai-deep transition-colors duration-base ease-settle"
            >
              {site.label}
              <ExternalLink size={10} aria-hidden />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

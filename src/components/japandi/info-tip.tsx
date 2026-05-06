'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * InfoTip — small (i) icon with a portal-mounted tooltip.
 *
 * Why portals: cards on the directory and quiz results pages use
 * `overflow-hidden` to clip the hero image's rounded corners, which
 * also clips any in-flow tooltip. Rendering the tooltip via
 * createPortal to document.body lets it escape that clip and sit
 * over the card naturally.
 *
 * Position is computed from the icon's screen rect (top + horizontal
 * centre) and recomputed on scroll/resize so the tooltip stays glued
 * to the icon as the page moves.
 *
 * Behaviour:
 *  - desktop: shown on hover (mouseenter) and keyboard focus
 *  - mobile: tap to toggle (onClick) — also stops the parent <Link>
 *    from navigating when the icon is clicked
 *  - click outside: closes (mousedown listener while open)
 */
export function InfoTip({
  text,
  /** Override the tooltip width if a particular surface is narrow. */
  maxWidth = 260,
  /** Render a custom trigger (e.g. an entire pill) instead of the
   *  default 13px "i" circle. Whatever you pass becomes the contents
   *  of the underlying <button>, so it stays a single tap target. */
  children,
  /** Override the trigger's className when supplying custom children
   *  — defaults to the small "i" circle styling. */
  triggerClassName,
}: {
  text: string;
  maxWidth?: number;
  children?: ReactNode;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  // `left` is the tooltip's *centre* x in document coords (we still
  // translate(-50%) to centre the box on it). `caretOffset` shifts the
  // caret from the tooltip's centre back to the icon's centre when we
  // had to clamp the tooltip away from a viewport edge — so the caret
  // still points at the icon even though the box moved.
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, caretOffset: 0 });

  useEffect(() => setMounted(true), []);

  // Recompute position whenever the tooltip opens or the page moves.
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      // Clamp tooltip width to the viewport with 16px breathing room
      // on each side (matches the calc(100vw - 32px) cap below).
      const tipWidth = Math.min(maxWidth, vw - 32);
      const iconCentreX = rect.left + rect.width / 2;
      // Keep the tooltip's full box at least 16px from each viewport
      // edge — when the icon sits near the edge the tooltip slides
      // inward instead of clipping off-screen.
      const minCentre = 16 + tipWidth / 2;
      const maxCentre = vw - 16 - tipWidth / 2;
      const clampedCentre = Math.max(minCentre, Math.min(maxCentre, iconCentreX));
      setPos({
        top: rect.top + window.scrollY,
        left: clampedCentre + window.scrollX,
        width: tipWidth,
        caretOffset: iconCentreX - clampedCentre,
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, maxWidth]);

  // Click-outside dismissal — only attached while the tip is open.
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        buttonRef.current?.contains(t) ||
        tipRef.current?.contains(t)
      )
        return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        tabIndex={-1}
        aria-label="More information"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={
          triggerClassName ??
          'inline-flex w-[13px] h-[13px] rounded-full border border-stone/40 text-stone/60 text-[8px] font-bold leading-none items-center justify-center cursor-help hover:border-ai hover:text-ai focus-visible:border-ai focus-visible:text-ai transition-colors'
        }
      >
        {children ?? 'i'}
      </button>
      {mounted &&
        open &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            className="text-[12px] leading-[1.55] tracking-normal normal-case font-normal text-kinu/95 bg-sumi rounded-lg shadow-[0_8px_24px_rgba(26,24,22,0.25)] pointer-events-none"
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, calc(-100% - 10px))',
              width: pos.width || maxWidth,
              padding: '12px 14px',
              zIndex: 1000,
              fontFamily: 'var(--font-ui)',
            }}
          >
            {text}
            {/* Caret pointing down to the icon. Shifts to track the icon
                when the tooltip was clamped away from a viewport edge. */}
            <span
              aria-hidden
              className="absolute top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-sumi"
              style={{
                left: `calc(50% + ${pos.caretOffset}px)`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * Scroll-reveal engine — single pooled IntersectionObserver.
 * Compositor-only: transform + opacity. Zero layout thrashing.
 * < 1KB. Works flawlessly on Safari, Chrome, iOS.
 */
'use client';

const OBSERVED = new WeakSet<Element>();

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer!.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  return observer;
}

export function observeReveal(el: Element | null): (() => void) | undefined {
  if (!el || OBSERVED.has(el)) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.classList.add('revealed');
    return;
  }

  OBSERVED.add(el);
  const obs = getObserver();
  obs.observe(el);

  return () => {
    obs.unobserve(el);
    OBSERVED.delete(el);
  };
}

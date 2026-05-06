// Shared classnames for the auth forms. Filled-card vocabulary —
// bg-kinu, rounded, soft shadow at rest, low-alpha indigo halo on
// focus. Matches the global Input component (src/components/ui/input.tsx)
// and the borderless treatment used across the rest of the site.
export const authLabelClass =
  'block text-[10px] font-bold uppercase tracking-[0.15em] text-stone mb-[6px]';

export const authInputClass =
  'w-full h-11 rounded-lg bg-kinu px-ma-4 font-ui text-[15px] text-sumi placeholder:text-ash outline-none transition-[box-shadow,background-color] duration-base ease-settle shadow-card hover:shadow-[0_2px_8px_rgba(26,24,22,0.06)] focus:shadow-[0_0_0_3px_rgba(61,90,122,0.15),0_2px_8px_rgba(26,24,22,0.06)] disabled:pointer-events-none disabled:opacity-50';

export const authErrorClass = 'mt-[6px] text-[12px] text-beni leading-snug';

export const authSubmitClass =
  'w-full h-12 bg-ai text-kinu text-sm font-semibold tracking-wide rounded-lg shadow-[0_2px_10px_-2px_rgba(61,90,122,0.4)] hover:bg-ai-deep hover:shadow-[0_4px_16px_-2px_rgba(61,90,122,0.5)] transition-[background-color,box-shadow] duration-base ease-settle disabled:opacity-60 disabled:cursor-not-allowed';

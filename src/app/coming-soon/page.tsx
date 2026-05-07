// src/app/coming-soon/page.tsx
//
// Pre-launch brand page. The full site is gated behind LAUNCH_MODE
// in src/middleware.ts — when that env is 'coming_soon', every public
// route redirects here. To bypass for preview, hit
// /?preview=<PREVIEW_KEY>; that sets a cookie that survives until
// Kaz signs off and we flip LAUNCH_MODE=live.
//
// noindex/nofollow so search engines don't snapshot the placeholder.
import { LogoLockup } from '@/components/brand';

export const metadata = {
  title: 'Japanoma — Coming soon',
  description:
    'Japanoma is a decision-aid platform for Australian buyers exploring property in Northern Japan snow country. Launching soon.',
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main className="min-h-[100svh] flex flex-col items-center justify-center px-ma-6 py-ma-16 bg-washi">
      <div className="text-center max-w-2xl">
        {/* Brand mark */}
        <div
          className="mb-ma-16 inline-flex justify-center text-sumi animate-fade-up"
          style={{ ['--fade-delay' as string]: '0ms' }}
        >
          <LogoLockup size="xl" />
        </div>

        {/* Overline */}
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone mb-ma-4 animate-fade-up"
          style={{ ['--fade-delay' as string]: '120ms' }}
        >
          A decision-aid platform for Australian buyers
        </p>

        {/* Title — same Shippori Mincho weight as the rest of the site */}
        <h1
          className="font-editorial text-[56px] sm:text-[80px] leading-[1.04] text-sumi mb-ma-8 animate-fade-up"
          style={{ ['--fade-delay' as string]: '200ms' }}
        >
          Coming soon.
        </h1>

        {/* Brand promise tagline — italic editorial voice */}
        <p
          className="font-editorial italic text-[18px] sm:text-[22px] leading-[1.5] text-sumi-light max-w-xl mx-auto mb-ma-12 animate-fade-up"
          style={{ ['--fade-delay' as string]: '300ms' }}
        >
          Own a Japan ski home base with clarity — not guesswork.
        </p>

        {/* Body */}
        <p
          className="text-[14px] sm:text-[15px] text-stone leading-[1.7] max-w-md mx-auto animate-fade-up"
          style={{ ['--fade-delay' as string]: '400ms' }}
        >
          Transparent total-cost models, practical due diligence, and
          introductions to licensed local professionals — built for Australian
          skiers exploring Northern Japan snow country.
        </p>

        {/* Footer attribution */}
        <div
          className="mt-ma-24 inline-flex items-center gap-ma-3 text-[11px] uppercase tracking-[0.16em] text-stone animate-fade-up"
          style={{ ['--fade-delay' as string]: '500ms' }}
        >
          <span className="w-[6px] h-[6px] rounded-full bg-ai" aria-hidden />
          <span>Operated by Go&amp;C Partners</span>
        </div>
      </div>
    </main>
  );
}

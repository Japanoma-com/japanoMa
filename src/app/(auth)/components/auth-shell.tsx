import type { ReactNode } from 'react';
import Link from 'next/link';

type Props = {
  overline?: string;
  heading: string;
  subtitle?: string;
  children: ReactNode;
  /** Optional footer slot for secondary links (forgot password, switch to sign up, etc.) */
  footerLinks?: ReactNode;
};

export function AuthShell({ overline, heading, subtitle, children, footerLinks }: Props) {
  return (
    <div className="w-full max-w-[440px]">
      {/* Borderless card on the Ma Space surface hierarchy:
          page=washi → card=shoji → input=kinu. The previous bg-kinu
          card put white inputs on a white surface — invisible.
          Shoji gives the card a soft warm tint just below the
          washi page, while keeping the kinu inputs visibly inset.
          16px radius and 32–40px internal padding for breathing
          room with the filled inputs. */}
      <div className="bg-shoji rounded-2xl p-ma-8 sm:p-ma-12 shadow-[0_4px_24px_-4px_rgba(26,24,22,0.08),0_1px_3px_rgba(26,24,22,0.04)]">
        {overline && (
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone">
            {overline}
          </p>
        )}
        <h1 className="font-editorial font-normal text-[28px] leading-tight text-sumi mt-ma-2">
          {heading}
        </h1>
        {subtitle && (
          <p className="mt-ma-3 text-sm text-sumi-light leading-body">{subtitle}</p>
        )}
        <div className="mt-ma-8">{children}</div>
        {/* Hairline rule via bg-shoji inset rather than a top-border
            stroke — matches the borderless treatment of the card. */}
        {footerLinks && (
          <div className="relative mt-ma-8 pt-ma-6">
            <span aria-hidden className="absolute top-0 left-0 right-0 h-px bg-border/60" />
            {footerLinks}
          </div>
        )}
      </div>

      <p className="text-center mt-ma-6">
        <Link href="/" className="text-[11px] text-stone hover:text-sumi transition-colors duration-base ease-settle">
          ← Back to homepage
        </Link>
      </p>
    </div>
  );
}

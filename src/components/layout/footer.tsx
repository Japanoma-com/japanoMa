'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoLockup } from '@/components/brand';

const footerLinks = [
  { href: '/areas', label: 'Areas' },
  { href: '/content', label: 'Content' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/changelog', label: 'Changelog' },
];

export function Footer() {
  const pathname = usePathname();
  // Hidden on the pre-launch coming-soon page so the brand mark there
  // reads as the standalone centerpiece (no nav, no chrome).
  if (pathname === '/coming-soon') return null;

  return (
    <footer className="border-t border-bamboo/50 mt-ma-32">
      <div className="ma-page px-ma-6 py-ma-16">
        <div className="flex flex-col gap-ma-12 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex flex-col gap-ma-4">
            <Link
              href="/"
              aria-label="JapanoMa — home"
              className="text-sumi inline-flex transition-colors duration-base ease-settle hover:text-sumi-light"
            >
              <LogoLockup size="md" />
            </Link>
            <div className="max-w-[320px]">
              <p className="text-sm text-sumi-light mb-ma-1">
                Decision-aid, not a listings portal.
              </p>
              <p className="text-xs text-stone">
                Tools and truth before you talk to anyone selling.
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-ma-6 gap-y-ma-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-stone transition-colors duration-base ease-settle hover:text-sumi-light"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-ma-8 pt-ma-6 border-t border-bamboo/30 flex flex-col gap-ma-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-stone">
            &copy; {new Date().getFullYear()} Go&amp;C Partners. All rights reserved.
          </p>
          <p className="text-xs text-stone">
            Nagano &amp; Niigata, Japan
          </p>
        </div>
      </div>
    </footer>
  );
}

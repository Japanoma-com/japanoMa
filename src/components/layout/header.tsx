'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { LogoLockup } from '@/components/brand';
import { NavMapChip } from '@/components/journey/nav-map-chip';
import type { JourneyState } from '@/lib/journey/types';

const navItems = [
  { href: '/quiz', label: 'Quiz', labelJa: 'クイズ' },
  { href: '/areas', label: 'Areas', labelJa: 'エリア' },
  { href: '/content', label: 'Content', labelJa: 'コンテンツ' },
  { href: '/contact', label: 'Contact', labelJa: 'お問い合わせ' },
];

interface HeaderProps {
  user: { name: string | null; email: string } | null;
  journeyState: JourneyState;
}

export function Header({ user, journeyState }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isHome = pathname === '/';
  const overlay = isHome && !scrolled && !isOpen;

  // Adaptive overlay: transparent nav over the home hero, solid nav
  // once the user scrolls past the image (or on any non-home page).
  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const focusable = menuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    if (focusable.length > 0) focusable[0].focus();

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !menuRef.current) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [isOpen]);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // The pre-launch coming-soon page renders standalone — no nav,
  // no logo lockup chrome — so the brand mark on that page lives
  // alone and reads as the centerpiece. Early-return AFTER all hooks
  // to keep call order stable.
  if (pathname === '/coming-soon') return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-settle ${
          overlay
            ? 'bg-transparent border-b border-transparent'
            : 'bg-washi/85 backdrop-blur-md border-b border-border/60 shadow-[0_1px_0_rgba(26,24,22,0.02)]'
        }`}
      >
        <div className="ma-page flex h-16 items-center justify-between px-ma-6">
          <Link
            href="/"
            aria-label="JapanoMa — home"
            className={`transition-colors duration-300 ease-settle ${
              overlay ? 'text-kinu' : 'text-sumi'
            }`}
          >
            <LogoLockup size="md" />
          </Link>

          {/* Journey chip — md+ to keep mobile header uncluttered.
              Hidden on the home page: the landing surface is a marketing
              hero, the chip adds chrome there and conflicts with the
              hero's full-bleed stacking context. */}
          {!isHome && (
            <div className="hidden md:block">
              <NavMapChip initialState={journeyState} signedIn={!!user} />
            </div>
          )}

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-ma-8">
            {navItems.map((item) => {
              const isCurrent = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-ui transition-colors duration-300 ease-settle ${
                    isCurrent
                      ? overlay ? 'text-kinu' : 'text-ai'
                      : overlay ? 'text-kinu/70 hover:text-kinu' : 'text-sumi-light hover:text-sumi'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <Link
                href="/account"
                className={`text-sm font-ui transition-colors duration-300 ease-settle ${
                  pathname === '/account'
                    ? overlay ? 'text-kinu' : 'text-ai'
                    : overlay ? 'text-kinu/70 hover:text-kinu' : 'text-sumi-light hover:text-sumi'
                }`}
              >
                {user.name ?? user.email}
              </Link>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                className={`text-sm font-ui transition-colors duration-300 ease-settle ${
                  overlay ? 'text-kinu/70 hover:text-kinu' : 'text-sumi-light hover:text-sumi'
                }`}
              >
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            ref={buttonRef}
            onClick={toggle}
            className="sm:hidden relative w-10 h-10 flex items-center justify-center focus:outline-none focus-visible:!shadow-none"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="shoji-menu"
          >
            <div className="w-5 h-4 relative">
              <span
                className={`absolute left-0 right-0 h-[1.5px] transition-all duration-base ease-settle origin-center ${
                  overlay ? 'bg-kinu' : 'bg-sumi'
                }`}
                style={{
                  top: isOpen ? '50%' : '0',
                  transform: isOpen ? 'translateY(-50%) rotate(45deg)' : 'none',
                }}
              />
              <span
                className={`absolute left-0 right-0 h-[1.5px] top-1/2 -translate-y-1/2 transition-opacity duration-base ease-settle ${
                  overlay ? 'bg-kinu' : 'bg-sumi'
                }`}
                style={{ opacity: isOpen ? 0 : 1 }}
              />
              <span
                className={`absolute left-0 right-0 h-[1.5px] transition-all duration-base ease-settle origin-center ${
                  overlay ? 'bg-kinu' : 'bg-sumi'
                }`}
                style={{
                  bottom: isOpen ? 'auto' : '0',
                  top: isOpen ? '50%' : 'auto',
                  transform: isOpen ? 'translateY(-50%) rotate(-45deg)' : 'none',
                }}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Shoji mobile menu overlay */}
      <div
        id="shoji-menu"
        ref={menuRef}
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
        className="fixed inset-0 z-40 sm:hidden"
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-sumi/20 transition-opacity duration-slow ease-settle"
          style={{ opacity: isOpen ? 1 : 0 }}
          onClick={() => setIsOpen(false)}
        />

        {/* Shoji panel */}
        <div
          className="absolute top-0 right-0 bottom-0 w-full bg-washi transition-transform duration-[400ms] ease-settle flex flex-col"
          style={{
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            boxShadow: isOpen ? '-8px 0 32px rgba(26,24,22,0.06)' : 'none',
          }}
        >
          {/* Leading edge line — the shoji frame */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-border transition-opacity duration-slow ease-settle"
            style={{ opacity: isOpen ? 1 : 0 }}
          />

          {/* 間 watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-slow ease-settle"
            style={{
              opacity: isOpen ? 1 : 0,
              transitionDelay: isOpen ? '200ms' : '0ms',
            }}
          >
            <span
              className="font-editorial select-none"
              style={{
                fontSize: 'clamp(160px, 30vw, 280px)',
                color: 'rgba(26, 24, 22, 0.04)',
                lineHeight: 0.9,
                transform: 'translateX(15%)',
              }}
              aria-hidden="true"
            >
              間
            </span>
          </div>

          {/* Nav content */}
          <div className="flex-1 flex flex-col justify-center px-ma-12 pt-16 relative">
            <nav className="space-y-2">
              {navItems.map((item, i) => {
                const isCurrent = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group block py-ma-4 transition-all ease-settle focus:outline-none focus-visible:!shadow-none ${
                      isCurrent ? 'border-l-2 border-ai pl-ma-6' : 'border-l-2 border-transparent pl-ma-6'
                    }`}
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                      transition: `opacity 0.3s var(--ease-settle) ${isOpen ? 250 + i * 60 : 0}ms, transform 0.3s var(--ease-settle) ${isOpen ? 250 + i * 60 : 0}ms`,
                    }}
                  >
                    <span
                      className={`font-editorial text-2xl block transition-colors duration-base ease-settle ${
                        isCurrent
                          ? 'text-ai'
                          : 'text-sumi group-hover:text-ai-deep'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-xs text-stone mt-ma-1 block">
                      {item.labelJa}
                    </span>
                  </Link>
                );
              })}
              {user ? (
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className={`group block py-ma-4 transition-all ease-settle focus:outline-none focus-visible:!shadow-none ${
                    pathname === '/account' ? 'border-l-2 border-ai pl-ma-6' : 'border-l-2 border-transparent pl-ma-6'
                  }`}
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                    transition: `opacity 0.3s var(--ease-settle) ${isOpen ? 250 + navItems.length * 60 : 0}ms, transform 0.3s var(--ease-settle) ${isOpen ? 250 + navItems.length * 60 : 0}ms`,
                  }}
                >
                  <span className={`font-editorial text-2xl block transition-colors duration-base ease-settle ${pathname === '/account' ? 'text-ai' : 'text-sumi group-hover:text-ai-deep'}`}>
                    {user.name ?? 'Account'}
                  </span>
                  <span className="text-xs text-stone mt-ma-1 block">{user.email}</span>
                </Link>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  onClick={() => setIsOpen(false)}
                  className="group block py-ma-4 transition-all ease-settle focus:outline-none focus-visible:!shadow-none border-l-2 border-transparent pl-ma-6"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                    transition: `opacity 0.3s var(--ease-settle) ${isOpen ? 250 + navItems.length * 60 : 0}ms, transform 0.3s var(--ease-settle) ${isOpen ? 250 + navItems.length * 60 : 0}ms`,
                  }}
                >
                  <span className="font-editorial text-2xl block text-sumi group-hover:text-ai-deep transition-colors duration-base ease-settle">
                    Sign in
                  </span>
                  <span className="text-xs text-stone mt-ma-1 block">サインイン</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Footer tagline */}
          <div
            className="px-ma-12 pb-ma-12 transition-all ease-settle"
            style={{
              opacity: isOpen ? 1 : 0,
              transitionDelay: isOpen ? '450ms' : '0ms',
              transitionDuration: '300ms',
            }}
          >
            <div className="border-t border-border pt-ma-6">
              <p className="text-xs text-stone leading-relaxed">
                Decision-aid, not a listings portal.
              </p>
              <p className="text-xs text-ash mt-ma-1">
                Tools and truth before you talk to anyone selling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

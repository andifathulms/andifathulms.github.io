'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const t = useTranslations('nav');
  const ta = useTranslations('a11y');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { href: '/work', label: t('work') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  // While the mobile menu is open it behaves as a modal surface: Escape
  // closes it, Tab cycles inside it, the page underneath doesn't scroll, and
  // focus returns to the toggle on close. (Nav links close it via onClick.)
  useEffect(() => {
    if (!menuOpen) return;

    const focusables = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        ) ?? []
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;

      // The toggle sits outside the nav but is part of the modal surface, so
      // the cycle runs toggle → nav items → toggle.
      const items = [toggleRef.current, ...focusables()].filter(
        (el): el is HTMLElement => el !== null
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    focusables()[0]?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-line bg-navy/95 backdrop-blur-sm">
      <div className="max-w-page mx-auto px-gutter h-16 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-heading text-lead font-medium text-cream transition-colors hover:text-gold"
        >
          <Image
            src="/images/brand/logo-mark.svg"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-[7px] transition-transform group-hover:scale-105"
          />
          AFM Studio
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label={ta('main_nav')}>
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`nav-link text-sm transition-colors ${
                  active ? 'text-gold' : 'text-text-muted hover:text-cream'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <LocaleSwitcher />
        </nav>

        {/* Mobile menu button */}
        <button
          ref={toggleRef}
          className="md:hidden rounded text-text-muted hover:text-cream transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? ta('close_menu') : ta('open_menu')}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          ref={menuRef}
          id="mobile-nav"
          aria-label={ta('main_nav')}
          className="md:hidden border-t border-line bg-navy px-gutter py-4 flex flex-col gap-4"
        >
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`text-sm transition-colors ${
                  active ? 'text-gold' : 'text-text-muted'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            );
          })}
          <LocaleSwitcher />
        </nav>
      )}
    </header>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import { useEffect, useState } from 'react';

export default function Header() {
  const t = useTranslations('nav');
  const ta = useTranslations('a11y');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/work', label: t('work') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  // Close the mobile menu on Escape. (Nav links close it via their onClick.)
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gold/10 bg-navy/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading text-lg font-medium text-cream hover:text-gold transition-colors">
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
                className={`text-sm transition-colors ${
                  active ? 'text-gold' : 'text-cream/70 hover:text-cream'
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
          className="md:hidden rounded text-cream/70 hover:text-cream transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
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
          id="mobile-nav"
          aria-label={ta('main_nav')}
          className="md:hidden border-t border-gold/10 bg-navy px-6 py-4 flex flex-col gap-4"
        >
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`text-sm transition-colors ${
                  active ? 'text-gold' : 'text-cream/70'
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

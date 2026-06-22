import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');

  return (
    <footer className="border-t border-gold/20 mt-24">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Left: tagline + copyright */}
          <div>
            <p className="font-heading text-lg font-medium text-cream mb-3">AFM Studio</p>
            <p className="text-sm text-cream/60 leading-relaxed mb-4">{t('tagline')}</p>
            <p className="font-mono text-xs text-cream/30">{t('copyright')}</p>
          </div>

          {/* Middle: quick links */}
          <div>
            <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-4">
              {t('links_title')}
            </p>
            <nav className="flex flex-col gap-2">
              {[
                { href: '/work', label: tn('work') },
                { href: '/about', label: tn('about') },
                { href: '/contact', label: tn('contact') },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-cream/60 hover:text-cream transition-colors w-fit"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: socials + currently building */}
          <div>
            <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-4">
              {t('social_title')}
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {[
                { href: 'https://github.com/andifathulmukminin', label: 'GitHub' },
                { href: 'https://linkedin.com/in/andifathulmukminin', label: 'LinkedIn' },
                { href: 'https://tiktok.com/@nusantaramapper', label: 'TikTok' },
                { href: 'mailto:officialandifathul@gmail.com', label: 'Email' },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-sm text-cream/60 hover:text-cream transition-colors w-fit"
                >
                  {label}
                </a>
              ))}
            </div>
            <p className="font-mono text-xs text-cream/30">
              {t('currently_building')}{' '}
              <span className="text-clay/70">AFM Studio</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

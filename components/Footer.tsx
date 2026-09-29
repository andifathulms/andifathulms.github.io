import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { SOCIALS } from '@/lib/site';

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  // Build time is "now" for a static site; the year moves on with each deploy.
  const year = new Date().getFullYear();

  const pages = [
    { href: '/work', label: tn('work') },
    { href: '/lab', label: tn('lab') },
    { href: '/about', label: tn('about') },
    { href: '/cv', label: tn('cv') },
    { href: '/contact', label: tn('contact') },
  ];

  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-page px-gutter py-section-tight">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <Image
                src="/images/brand/logo-mark.svg"
                alt=""
                aria-hidden="true"
                width={32}
                height={32}
                className="h-8 w-8 rounded-[7px]"
              />
              <p className="font-heading text-lead text-cream">AFM Studio</p>
            </div>
            <p className="mb-5 max-w-sm text-body leading-relaxed text-text-muted">{t('tagline')}</p>
            <p className="font-mono text-xs text-text-subtle">{t('copyright', { year })}</p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-text-subtle">
              {t('links_title')}
            </p>
            <nav className="flex flex-col gap-2.5">
              {pages.map(({ href, label }) => (
                <Link key={href} href={href} className="w-fit text-sm text-text-muted transition-colors hover:text-cream">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-text-subtle">
              {t('social_title')}
            </p>
            <div className="flex flex-col gap-2.5">
              {SOCIALS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-fit text-sm text-text-muted transition-colors hover:text-cream"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

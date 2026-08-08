'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LANGUAGE_KEY: Record<string, string> = { en: 'language_en', id: 'language_id' };

/**
 * Links, not buttons: switching locale is a navigation to a real URL that
 * exists at build time, so it belongs in the link list, supports middle-click
 * and open-in-new-tab, and works without JS. The previous button version also
 * marked the active locale `disabled`, which removed it from the tab order
 * instead of marking it current.
 */
export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const ta = useTranslations('a11y');

  return (
    <div className="flex items-center gap-1 font-mono text-meta">
      {routing.locales.map((l, i) => {
        const current = l === locale;
        const language = ta(LANGUAGE_KEY[l]);
        return (
          <span key={l} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-text-subtle" aria-hidden="true">
                /
              </span>
            )}
            <Link
              href={pathname}
              locale={l}
              lang={l}
              hrefLang={l}
              aria-current={current ? 'true' : undefined}
              // "EN" reads as two letters; the name says which language it is.
              aria-label={current ? language : ta('switch_to', { language })}
              className={
                current
                  ? 'min-h-touch inline-flex items-center px-1 text-gold font-medium'
                  : 'min-h-touch inline-flex items-center px-1 text-text-subtle hover:text-cream transition-colors'
              }
            >
              {l.toUpperCase()}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-cream/20">/</span>}
          <button
            onClick={() => switchLocale(l)}
            className={
              l === locale
                ? 'text-gold font-medium cursor-default'
                : 'text-cream/50 hover:text-cream transition-colors cursor-pointer'
            }
            disabled={l === locale}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

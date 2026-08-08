import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { PortfolioStats } from '@/lib/content';
import CountUp from './CountUp';

/**
 * `hero` renders the counts as a compact 2×2 block inside the top fold — the
 * fastest credibility signal the site has, so it sits above the scroll rather
 * than in a band below it. `band` is the standalone full-width section.
 */
export default function StatBand({
  stats,
  variant = 'band',
}: {
  stats: PortfolioStats;
  variant?: 'band' | 'hero';
}) {
  const t = useTranslations('home.stats');
  const hero = variant === 'hero';

  const items = [
    { value: stats.total, label: t('systems_shipped'), filter: 'all' },
    { value: stats.government, label: t('government'), filter: 'government' },
    { value: stats.independent, label: t('independent'), filter: 'independent' },
    { value: stats.live, label: t('live'), filter: 'live' },
  ];

  const grid = (
    <div
      className={
        hero
          ? 'grid grid-cols-2 gap-x-6 gap-y-8'
          : 'grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10'
      }
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.filter === 'all' ? '/work' : `/work?filter=${item.filter}`}
          className="group block"
        >
          <span
            className={`block font-heading font-medium text-gold leading-none ${
              hero ? 'text-h2 mb-1.5' : 'text-stat mb-2.5'
            }`}
          >
            <CountUp end={item.value} />
          </span>
          <span
            className={`inline-flex items-center gap-1 text-text-muted transition-colors group-hover:text-cream ${
              hero ? 'text-meta' : 'text-body'
            }`}
          >
            {item.label}
            <span
              aria-hidden="true"
              className="text-gold opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 motion-reduce:transition-none motion-reduce:translate-x-0"
            >
              →
            </span>
          </span>
        </Link>
      ))}
    </div>
  );

  if (hero) {
    return (
      <div className="border-t border-line pt-6">
        <p className="font-mono text-meta uppercase tracking-widest text-accent mb-6">
          {t('title')}
        </p>
        {grid}
      </div>
    );
  }

  return (
    <section className="border-t border-line py-section-tight px-gutter">
      <div className="max-w-page mx-auto">{grid}</div>
    </section>
  );
}

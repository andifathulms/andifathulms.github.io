import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { PortfolioStats } from '@/lib/content';
import CountUp from './CountUp';

export default function StatBand({ stats }: { stats: PortfolioStats }) {
  const t = useTranslations('home.stats');

  const items = [
    { value: stats.total, label: t('systems_shipped'), filter: 'all' },
    { value: stats.government, label: t('government'), filter: 'government' },
    { value: stats.independent, label: t('independent'), filter: 'independent' },
    { value: stats.live, label: t('live'), filter: 'live' },
  ];

  return (
    <section className="border-t border-gold/20 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.filter === 'all' ? '/work' : `/work?filter=${item.filter}`}
              className="group block"
            >
              <span className="block font-heading text-stat font-medium text-gold leading-none mb-2.5">
                <CountUp end={item.value} />
              </span>
              <span className="inline-flex items-center gap-1 text-body text-text-muted transition-colors group-hover:text-cream">
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
      </div>
    </section>
  );
}

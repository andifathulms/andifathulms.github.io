import { useTranslations } from 'next-intl';
import type { PortfolioStats } from '@/lib/content';
import CountUp from './CountUp';

export default function StatBand({ stats }: { stats: PortfolioStats }) {
  const t = useTranslations('home.stats');

  const items = [
    { value: stats.total, label: t('systems_shipped') },
    { value: stats.government, label: t('government') },
    { value: stats.independent, label: t('independent') },
    { value: stats.live, label: t('live') },
  ];

  return (
    <section className="border-t border-gold/20 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((item) => (
            <div key={item.label}>
              <dt className="sr-only">{item.label}</dt>
              <dd className="font-heading text-4xl md:text-5xl font-medium text-gold leading-none mb-2.5">
                <CountUp end={item.value} />
              </dd>
              <p className="text-sm text-cream/55 leading-snug">{item.label}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

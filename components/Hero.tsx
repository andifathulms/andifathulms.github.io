import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className="pt-40 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium text-cream leading-tight mb-6 max-w-3xl">
          {t('headline')}
        </h1>
        <p className="text-base md:text-lg text-cream/70 max-w-xl leading-relaxed mb-10">
          {t('subheadline')}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/work"
            className="px-6 py-3 bg-gold text-navy text-sm font-medium rounded hover:bg-gold/90 transition-colors"
          >
            {t('cta_work')}
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 border border-cream/20 text-cream text-sm font-medium rounded hover:border-cream/40 transition-colors"
          >
            {t('cta_start')}
          </Link>
        </div>
      </div>
    </section>
  );
}

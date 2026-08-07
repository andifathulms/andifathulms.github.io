import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import HeroVisual from './HeroVisual';

export default function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className="pt-40 pb-24 px-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
        <div>
          <h1 className="anim-fade-up font-heading text-display font-medium text-cream leading-tight mb-6">
            {t('headline')}
          </h1>
          <p className="anim-fade-up anim-delay-1 text-lead text-text-muted max-w-xl leading-relaxed mb-10">
            {t('subheadline')}
          </p>
          <div className="anim-fade-up anim-delay-2 flex flex-wrap gap-4">
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

        {/* Decorative brand motif — desktop only, keeps the top fold from feeling empty */}
        <div className="anim-fade-up anim-delay-1 hidden lg:block">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

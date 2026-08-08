import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { PortfolioStats } from '@/lib/content';
import StatBand from './StatBand';

export default function Hero({ stats }: { stats: PortfolioStats }) {
  const t = useTranslations('home.hero');

  return (
    <section className="pt-hero-top pb-section px-gutter">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 lg:items-start">
        <div>
          <p className="anim-fade-up font-mono text-meta uppercase tracking-widest text-accent mb-5">
            {t('eyebrow')}
          </p>
          <h1 className="anim-fade-up font-heading text-display font-medium text-cream mb-6">
            {t('headline')}
          </h1>
          <p className="anim-fade-up anim-delay-1 text-lead text-text-muted max-w-xl mb-10">
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
              className="px-6 py-3 border border-edge text-cream text-sm font-medium rounded hover:border-edge-strong transition-colors"
            >
              {t('cta_start')}
            </Link>
          </div>
        </div>

        {/* Proof, not decoration — the portfolio counts sit inside the fold so
            a first-time visitor gets evidence before they scroll. Top-aligned
            with the headline (clearing the eyebrow line) so claim and evidence
            read as a pair rather than the counts floating mid-column. */}
        <div className="anim-fade-up anim-delay-2 lg:mt-11">
          <StatBand stats={stats} variant="hero" />
        </div>
      </div>
    </section>
  );
}

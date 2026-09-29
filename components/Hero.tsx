import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { PortfolioStats, ProjectMeta } from '@/lib/content';
import { CONTACT } from '@/lib/site';

/**
 * Who, where, and what for — in that order. The right half is the work
 * itself: three government systems, so the first screen carries proof
 * instead of a row of counters.
 */
export default function Hero({
  stats,
  collage,
}: {
  stats: PortfolioStats;
  collage: ProjectMeta[];
}) {
  const t = useTranslations('home.hero');

  const facts = [
    { value: stats.government, label: t('fact_government') },
    { value: stats.independent, label: t('fact_lab') },
    { value: stats.live, label: t('fact_live') },
  ];

  // Three overlapping frames; positions are fixed so the composition doesn't
  // depend on each screenshot's own aspect ratio.
  const frames = [
    'left-0 top-0 w-[78%] h-[47%]',
    'right-0 top-[29%] w-[70%] h-[42%]',
    'left-[6%] bottom-0 w-[64%] h-[34%]',
  ];
  // Each caption goes in a corner the next frame doesn't cover.
  const captions = ['bottom-2 left-2', 'top-2 right-2', 'bottom-2 left-2'];

  return (
    <section className="px-gutter pb-section pt-hero-top">
      <div className="mx-auto grid max-w-page gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div>
          <p className="anim-fade-up mb-7 inline-flex items-center gap-2.5 rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-text-muted">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-lagoon" />
            {t('availability')}
          </p>
          <h1 className="anim-fade-up mb-7 font-heading text-display font-normal tracking-[-0.025em] text-cream">
            {t.rich('headline', {
              em: (chunks) => <em className="italic text-gold">{chunks}</em>,
            })}
          </h1>
          <p className="anim-fade-up anim-delay-1 mb-9 max-w-xl text-lead text-text-muted">
            {t('subheadline')}
          </p>

          <dl className="anim-fade-up anim-delay-1 mb-10 flex flex-wrap gap-x-10 gap-y-4">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col-reverse">
                <dt className="text-sm text-text-muted">{f.label}</dt>
                <dd className="font-heading text-stat leading-none text-cream">{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="anim-fade-up anim-delay-2 flex flex-wrap gap-3">
            <Link
              href="/work"
              className="inline-flex min-h-touch items-center rounded-control bg-gold px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-gold/90"
            >
              {t('cta_work')}
            </Link>
            <a
              href={CONTACT.cvPdf}
              download
              className="inline-flex min-h-touch items-center gap-2 rounded-control border border-edge px-5 py-3 text-sm font-medium text-cream transition-colors hover:border-edge-strong"
            >
              {t('cta_cv')}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        {collage.length > 0 && (
          <div
            role="img"
            aria-label={t('collage_label')}
            className="anim-fade-up anim-delay-2 relative mx-auto aspect-square w-full max-w-[34rem]"
          >
            {collage.slice(0, 3).map((p, i) => (
              <figure
                key={p.slug}
                className={`absolute m-0 overflow-hidden rounded-media border border-line-strong bg-deck ${frames[i]}`}
              >
                {p.heroImage && (
                  <Image
                    src={p.heroImage}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 80vw, 420px"
                    className="object-cover object-top"
                  />
                )}
                <figcaption className={`absolute ${captions[i]} inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-navy px-2 py-1 font-mono text-xs text-cream`}>
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-[2px] bg-clay" />
                  {p.title}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

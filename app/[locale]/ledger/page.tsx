import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import {
  getAllMetrics,
  getPortfolioStats,
  getShapeCounts,
  getStackUsage,
  PROBLEM_SHAPES,
} from '@/lib/content';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ledger' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function LedgerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ledger' });
  const ts = await getTranslations({ locale, namespace: 'home.stats' });
  const tw = await getTranslations({ locale, namespace: 'work' });

  const stats = getPortfolioStats();
  const shapes = getShapeCounts();
  const stack = getStackUsage();
  const metrics = getAllMetrics();

  const derived = [
    { claim: ts('systems_shipped'), value: stats.total, rule: t('rule_total') },
    { claim: ts('government'), value: stats.government, rule: t('rule_government') },
    { claim: ts('independent'), value: stats.independent, rule: t('rule_independent') },
    { claim: ts('live'), value: stats.live, rule: t('rule_live') },
  ];

  // Group the per-project figures under the case study that declares them, so
  // each block is one click from the page where the claim is actually made.
  const byProject = metrics.reduce<Record<string, { title: string; rows: typeof metrics }>>(
    (acc, entry) => {
      acc[entry.slug] ??= { title: entry.title, rows: [] };
      acc[entry.slug].rows.push(entry);
      return acc;
    },
    {}
  );

  return (
    <div className="pt-28 pb-section px-gutter">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading text-h1 font-medium text-cream mb-4">{t('title')}</h1>
        <p className="text-lead text-text-muted mb-6">{t('subtitle')}</p>
        <p className="text-body text-text-muted">{t('intro')}</p>

        {/* 1. Counted at build time from the manifests */}
        <section className="border-t border-line mt-14 pt-10">
          <h2 className="font-heading text-h3 font-medium text-cream mb-3">
            {t('derived_title')}
          </h2>
          <p className="text-body text-text-muted mb-8">
            {t('derived_note', { total: stats.total })}
          </p>

          <dl className="flex flex-col">
            {derived.map((row) => (
              // dt before dd so the claim is announced before its number, and
              // the rule lives inside the dd rather than as a `p` that isn't a
              // legal child of a dl.
              <div
                key={row.claim}
                className="border-t border-line py-4 grid grid-cols-[auto_1fr] gap-x-5 items-baseline"
              >
                <dt className="col-start-2 row-start-1 text-body text-cream">{row.claim}</dt>
                <dd className="col-start-1 row-start-1 row-span-2 font-heading text-h3 text-gold leading-none tabular-nums">
                  {row.value}
                </dd>
                <dd className="col-start-2 row-start-2 mt-1 font-mono text-meta text-text-subtle">
                  {row.rule}
                </dd>
              </div>
            ))}
          </dl>

          <h3 className="font-heading text-lead font-medium text-cream mt-10 mb-2">
            {t('shapes_title')}
          </h3>
          <p className="font-mono text-meta text-text-subtle mb-4">{t('rule_shape')}</p>
          <div className="flex flex-wrap gap-2">
            {PROBLEM_SHAPES.map((shape) => (
              <Link
                key={shape}
                href={`/work?shape=${shape}`}
                className="font-mono text-meta rounded border border-cream/15 px-3.5 py-1.5 text-text-muted transition-colors hover:border-gold/50 hover:text-gold"
              >
                {tw(`shape_${shape}`)}
                <span className="ml-1.5 text-accent">{shapes[shape]}</span>
              </Link>
            ))}
          </div>

          <h3 className="font-heading text-lead font-medium text-cream mt-10 mb-2">
            {t('stack_title')}
          </h3>
          <p className="font-mono text-meta text-text-subtle mb-4">{t('rule_stack')}</p>
          <p className="font-mono text-meta text-text-muted leading-relaxed mb-4">
            {stack
              .filter((tech) => tech.count > 1)
              .map((tech) => `${tech.name} ${tech.count}`)
              .join(' · ')}
          </p>
          <Link href="/about" className="text-body text-accent hover:text-cream transition-colors">
            {t('stack_link')} →
          </Link>
        </section>

        {/* 2. Declared per project, rendered on that project's case study */}
        <section className="border-t border-line mt-14 pt-10">
          <h2 className="font-heading text-h3 font-medium text-cream mb-3">
            {t('metrics_title')}
          </h2>
          <p className="text-body text-text-muted mb-8">
            {t('metrics_note', { count: metrics.length })}
          </p>

          <div className="flex flex-col gap-8">
            {Object.entries(byProject).map(([slug, project]) => (
              <div key={slug}>
                <Link
                  href={`/work/${slug}`}
                  className="group inline-flex items-baseline gap-2 font-heading text-lead font-medium text-cream transition-colors hover:text-gold mb-3"
                >
                  {project.title}
                  <span
                    aria-hidden="true"
                    className="font-sans text-meta text-gold opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    →
                  </span>
                </Link>
                <dl className="flex flex-col">
                  {project.rows.map((row) => (
                    <div
                      key={`${row.value}-${row.label}`}
                      className="border-t border-line py-2 flex flex-row-reverse justify-end items-baseline gap-4"
                    >
                      <dt className="text-body text-text-muted">{row.label}</dt>
                      <dd className="font-mono text-meta text-accent tabular-nums min-w-24 flex-shrink-0">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        {/* 3. The honest residue — what a build can't check */}
        <section className="border-t border-line mt-14 pt-10">
          <h2 className="font-heading text-h3 font-medium text-cream mb-3">
            {t('residue_title')}
          </h2>
          <p className="text-body text-text-muted">{t('residue_note')}</p>
        </section>
      </div>
    </div>
  );
}

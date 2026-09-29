import { existsSync } from 'fs';
import path from 'path';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { CONTACT, PERSON, routeMetadata } from '@/lib/site';
import { Link } from '@/i18n/navigation';
import StackUsageList from '@/components/StackUsageList';
import SocialLinks from '@/components/SocialLinks';
import { getFeaturedProjects, getPortfolioStats, getStackUsage } from '@/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return routeMetadata({
    locale,
    path: '/about',
    title: t('title'),
    description: t('intro'),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });
  const ts = await getTranslations({ locale, namespace: 'home.stats' });

  const hasPhoto = existsSync(path.join(process.cwd(), 'public/images/about/photo.jpg'));
  const stats = getPortfolioStats();
  const featured = getFeaturedProjects(4, locale);

  const statItems = [
    { value: stats.total, label: ts('systems_shipped') },
    { value: stats.government, label: ts('government') },
    { value: stats.independent, label: ts('independent') },
    { value: stats.live, label: ts('live') },
  ];

  // Everything used more than once gets a counted row; the long tail of
  // one-offs is listed plainly rather than dropped, so the section stays a
  // complete account of the portfolio instead of a flattering excerpt.
  const stackUsage = getStackUsage();
  const stackUsed = stackUsage.filter((tech) => tech.count > 1);
  const stackOnce = stackUsage.filter((tech) => tech.count === 1);

  // Already sorted by count (getStackUsage), so the first 8 rows carry the
  // argument on their own; the rest stays available, just not first-paint
  // weight, in front of "Selected work" — the section that should be the
  // emotional high point before the CTA.
  const STACK_VISIBLE = 8;
  const stackTop = stackUsed.slice(0, STACK_VISIBLE);
  const stackRest = stackUsed.slice(STACK_VISIBLE);

  return (
    <div className="pt-page-top pb-section px-gutter">
      <div className="max-w-page mx-auto">

        {/* 1. Photo + name + role strip */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center mb-20">
          {hasPhoto ? (
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto md:mx-0 rounded-2xl overflow-hidden flex-shrink-0 border border-line">
              <Image
                src="/images/about/photo.jpg"
                alt="Andi Fathul Mukminin"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 256px, 320px"
              />
            </div>
          ) : (
            <div className="w-64 h-64 md:w-80 md:h-80 mx-auto md:mx-0 rounded-2xl bg-deck border border-line flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-display text-accent select-none">AF</span>
            </div>
          )}

          <div>
            <p className="font-mono text-xs text-text-subtle uppercase tracking-widest mb-4">
              {t('title')}
            </p>
            <h1 className="font-heading text-h1 font-normal text-cream mb-3">
              {PERSON.name}
            </h1>
            <p className="text-lead text-text-muted mb-8">{t('intro')}</p>
            <div className="space-y-3">
              {[
                { label: t('role_label'), value: t('role_value') },
                { label: t('directorate_label'), value: t('directorate_value') },
                { label: t('location_label'), value: t('location_value') },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 items-baseline">
                  <span className="font-mono text-xs text-text-subtle uppercase tracking-widest w-28 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-text-muted text-body">{value}</span>
                </div>
              ))}
            </div>

            {/* Social / professional channels */}
            <div className="mt-8">
              <p className="font-mono text-xs text-text-subtle uppercase tracking-widest mb-3">
                {t('connect_label')}
              </p>
              <SocialLinks />
              <a
                href={CONTACT.cvPdf}
                download
                className="mt-4 inline-flex min-h-touch items-center gap-2 rounded-control border border-edge px-4 py-2 text-sm text-cream transition-colors hover:border-edge-strong"
              >
                {t('cta_cv')}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>

        {/* Stats echo — instant credibility for direct landings */}
        <div className="border-y border-line py-6 mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {statItems.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-stat font-normal text-cream leading-none mb-1.5">
                  {s.value}
                </p>
                <p className="text-meta text-text-subtle leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Positioning statement */}
        <figure className="max-w-doc mb-16 border-l-2 border-edge-accent pl-6">
          <blockquote className="font-heading text-h2 font-normal text-text-muted leading-snug">
            {t('pull_quote')}
          </blockquote>
        </figure>

        <div className="max-w-prose">
          {/* 2. Bio paragraphs */}
          <div className="space-y-6 text-lead text-text-prose leading-relaxed">
            <p>{t('bio_1')}</p>
            <p>{t('bio_2')}</p>
            <p>{t('bio_3')}</p>
            <p>{t('bio_4')}</p>
          </div>

          {/* 3. Availability */}
          <div className="border-t border-line mt-14 pt-10">
            <p className="font-mono text-xs text-text-subtle uppercase tracking-widest mb-3">
              {t('availability_label')}
            </p>
            <p className="text-text-muted leading-relaxed">{t('availability')}</p>
          </div>

          {/* 4. Tech stack — counted from the manifests, not asserted.
              A logo says "I have heard of Keycloak"; "7 systems" is a claim
              you can click. The old hand-maintained list gave Node.js (1
              project) the same weight as Django (16) and omitted Vitest (16)
              entirely — exactly the drift counting removes. */}
          <div className="border-t border-line mt-14 pt-10">
            <p className="font-mono text-xs text-text-subtle uppercase tracking-widest mb-3">
              {t('stack_title')}
            </p>
            <p className="text-body text-text-muted mb-8 max-w-xl">
              {t('stack_note', { total: stats.total })}
            </p>

            <StackUsageList
              items={stackTop}
              countLabel={(count) => t('stack_systems', { count })}
            />

            {stackRest.length > 0 && (
              <details className="mt-1 group/details">
                <summary className="cursor-pointer list-none font-mono text-xs text-text-subtle uppercase tracking-widest pt-3 pb-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
                  {t('stack_show_more', { count: stackRest.length })}
                </summary>
                <div className="mt-2">
                  <StackUsageList
                    items={stackRest}
                    countLabel={(count) => t('stack_systems', { count })}
                  />
                </div>
              </details>
            )}

            {stackOnce.length > 0 && (
              <p className="mt-6 text-sm text-text-subtle leading-relaxed">
                <span className="text-text-muted">{t('stack_once_label')}:</span>{' '}
                {stackOnce.map((tech) => tech.name).join(' · ')}
              </p>
            )}
          </div>

          {/* 5. Selected work — connect the narrative to real projects */}
          {featured.length > 0 && (
            <div className="border-t border-line mt-14 pt-10">
              <p className="font-mono text-xs text-text-subtle uppercase tracking-widest mb-5">
                {t('selected_work_label')}
              </p>
              <div className="flex flex-wrap gap-2.5 mb-5">
                {featured.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/work/${project.slug}`}
                    className="group min-h-touch inline-flex items-center gap-1.5 rounded-control border border-edge px-3.5 py-2 text-sm text-text-muted transition-colors hover:border-edge-accent hover:text-gold"
                  >
                    {project.title}
                  </Link>
                ))}
              </div>
              <Link
                href="/work"
                className="inline-flex min-h-touch items-center text-sm font-medium text-gold hover:text-cream transition-colors"
              >
                {t('view_all_work')} →
              </Link>
            </div>
          )}

          {/* 6. CTA */}
          <div className="border-t border-line mt-14 pt-10">
            <h2 className="font-heading text-h2 font-normal text-cream mb-3">
              {t('cta_title')}
            </h2>
            <p className="text-text-muted mb-6">{t('cta_body')}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-touch items-center rounded-control bg-gold px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-gold/90"
              >
                {t('cta_button')}
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
        </div>

      </div>
    </div>
  );
}

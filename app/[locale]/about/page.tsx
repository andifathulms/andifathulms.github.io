import { existsSync } from 'fs';
import path from 'path';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import StackIcon from '@/components/StackIcon';
import SocialLinks from '@/components/SocialLinks';
import { getFeaturedProjects, getPortfolioStats, getStackUsage } from '@/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('title'),
    description: t('intro'),
  };
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
  const featured = getFeaturedProjects(4);

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

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* 1. Photo + name + role strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          {hasPhoto ? (
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto md:mx-0 rounded-2xl overflow-hidden flex-shrink-0">
              <Image
                src="/images/about/photo.jpg"
                alt="Andi Fathul Mukminin"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 256px, 320px"
              />
            </div>
          ) : (
            <div className="w-64 h-64 md:w-80 md:h-80 mx-auto md:mx-0 rounded-2xl bg-navy border border-line flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-display text-accent select-none">AF</span>
            </div>
          )}

          <div>
            <p className="font-mono text-meta text-gold uppercase tracking-widest mb-4">
              {t('intro')}
            </p>
            <h1 className="font-heading text-h1 font-medium text-cream mb-8">
              {t('title')}
            </h1>
            <div className="space-y-3">
              {[
                { label: t('role_label'), value: t('role_value') },
                { label: t('directorate_label'), value: t('directorate_value') },
                { label: t('location_label'), value: t('location_value') },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 items-baseline">
                  <span className="font-mono text-meta text-accent uppercase tracking-wider w-28 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-text-muted text-body">{value}</span>
                </div>
              ))}
            </div>

            {/* Social / professional channels */}
            <div className="mt-8">
              <p className="font-mono text-meta text-accent uppercase tracking-wider mb-3">
                {t('connect_label')}
              </p>
              <SocialLinks />
            </div>
          </div>
        </div>

        {/* Stats echo — instant credibility for direct landings */}
        <div className="border-y border-line py-6 mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {statItems.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-stat font-medium text-gold leading-none mb-1.5">
                  {s.value}
                </p>
                <p className="text-meta text-text-subtle leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Positioning statement */}
        <figure className="max-w-3xl mb-16 border-l-2 border-gold/50 pl-6">
          <blockquote className="font-heading text-h2 font-medium text-text-muted leading-snug">
            {t('pull_quote')}
          </blockquote>
        </figure>

        <div className="max-w-2xl">
          {/* 2. Bio paragraphs */}
          <div className="space-y-6 text-text-muted leading-relaxed">
            <p>{t('bio_1')}</p>
            <p>{t('bio_2')}</p>
            <p>{t('bio_3')}</p>
            <p>{t('bio_4')}</p>
          </div>

          {/* 3. Availability */}
          <div className="border-t border-line mt-14 pt-10">
            <p className="font-mono text-meta text-accent uppercase tracking-wider mb-3">
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
            <p className="font-mono text-meta text-accent uppercase tracking-wider mb-3">
              {t('stack_title')}
            </p>
            <p className="text-body text-text-muted mb-8 max-w-xl">
              {t('stack_note', { total: stats.total })}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1">
              {stackUsed.map((tech) => (
                <Link
                  key={tech.name}
                  href={`/work?q=${encodeURIComponent(tech.name)}`}
                  className="group flex items-center gap-3 border-b border-line py-2.5 transition-colors hover:border-line-strong"
                >
                  <StackIcon name={tech.name} className="w-5 h-5 flex-shrink-0 text-text-subtle transition-colors group-hover:text-gold" />
                  <span className="font-mono text-meta text-text-muted transition-colors group-hover:text-cream">
                    {tech.name}
                  </span>
                  <span className="ml-auto font-mono text-meta text-accent">
                    {t('stack_systems', { count: tech.count })}
                  </span>
                </Link>
              ))}
            </div>

            {stackOnce.length > 0 && (
              <p className="mt-6 font-mono text-meta text-text-subtle leading-relaxed">
                <span className="text-text-muted">{t('stack_once_label')}:</span>{' '}
                {stackOnce.map((tech) => tech.name).join(' · ')}
              </p>
            )}
          </div>

          {/* 5. Selected work — connect the narrative to real projects */}
          {featured.length > 0 && (
            <div className="border-t border-line mt-14 pt-10">
              <p className="font-mono text-meta text-accent uppercase tracking-wider mb-5">
                {t('selected_work_label')}
              </p>
              <div className="flex flex-wrap gap-2.5 mb-5">
                {featured.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/work/${project.slug}`}
                    className="group inline-flex items-center gap-1.5 rounded border border-cream/15 px-3.5 py-2 text-sm text-text-muted transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    {project.title}
                    <span
                      aria-hidden="true"
                      className="text-gold opacity-50 transition-opacity group-hover:opacity-100"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href="/work"
                className="text-sm text-accent hover:text-cream transition-colors"
              >
                {t('view_all_work')} →
              </Link>
            </div>
          )}

          {/* 6. CTA */}
          <div className="border-t border-line mt-14 pt-10">
            <h2 className="font-heading text-h2 font-medium text-cream mb-3">
              {t('cta_title')}
            </h2>
            <p className="text-text-muted mb-6">{t('cta_body')}</p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-gold text-navy text-sm font-medium rounded hover:bg-gold/90 transition-colors"
            >
              {t('cta_button')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { routeMetadata } from '@/lib/site';
import FlagshipRow from '@/components/FlagshipRow';
import TrackMark from '@/components/TrackMark';
import { getTrackProjects } from '@/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'work' });
  const count = getTrackProjects('government').length;
  return routeMetadata({
    locale,
    path: '/work',
    title: t('title'),
    description: t('subtitle', { count }),
  });
}

/**
 * The government track. Every system gets a full feature row: most of them
 * sit behind a login, so this page and the case studies are the only way a
 * visitor can see them.
 */
export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'work' });
  const th = await getTranslations({ locale, namespace: 'home.flagship' });
  const tc = await getTranslations({ locale, namespace: 'case_study' });

  const projects = getTrackProjects('government', locale);
  const labCount = getTrackProjects('lab').length;
  const labels = {
    read: th('read'),
    live: t('live_badge'),
    staging: tc('staging_badge'),
    private: t('private_short'),
    internal: tc('access_internal'),
  };

  return (
    <div className="px-gutter pb-section pt-page-top">
      <div className="mx-auto max-w-page">
        <header className="mb-16 max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2.5 font-mono text-meta uppercase tracking-wider text-text-subtle">
            <TrackMark track="government" />
            {th('kicker')}
          </p>
          <h1 className="mb-5 font-heading text-h1 font-normal text-cream">{t('title')}</h1>
          <p className="text-lead text-text-muted">{t('subtitle', { count: projects.length })}</p>
        </header>

        <div className="flex flex-col">
          {projects.map((project, i) => (
            <div key={project.slug} className="border-t border-line py-14 first:border-t-0 first:pt-0">
              <FlagshipRow
                project={project}
                labels={labels}
                reverse={i % 2 === 1}
                headingLevel="h2"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <Link
          href="/lab"
          className="group mt-8 flex flex-wrap items-center justify-between gap-4 rounded-media border border-line bg-deck p-6 transition-colors hover:border-line-strong sm:p-8"
        >
          <span>
            <span className="mb-1 inline-flex items-center gap-2.5 font-mono text-meta uppercase tracking-wider text-text-subtle">
              <TrackMark track="lab" />
              {t('lab_title')} · {labCount}
            </span>
            <span className="block font-heading text-h3 text-cream">{t('lab_link_title')}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold">
            {t('lab_link')}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}

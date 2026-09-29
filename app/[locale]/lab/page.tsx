import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/site';
import WorkGallery from '@/components/WorkGallery';
import TrackMark from '@/components/TrackMark';
import { getAllProjects, getTrackProjects } from '@/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'work' });
  return routeMetadata({
    locale,
    path: '/lab',
    title: t('lab_title'),
    description: t('lab_subtitle', { count: getTrackProjects('lab').length }),
  });
}

/**
 * The independent lab. The gallery receives every project, not just the lab
 * ones, so a stack search from the About page ("Django — 16 projects") can
 * switch to "All" and show the government systems that use it too.
 */
export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'work' });

  const projects = getAllProjects(locale).filter((p) => p.status !== 'placeholder');
  const labCount = getTrackProjects('lab').length;

  return (
    <div className="px-gutter pb-section pt-page-top">
      <div className="mx-auto max-w-page">
        <header className="mb-12 max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2.5 font-mono text-meta uppercase tracking-wider text-text-subtle">
            <TrackMark track="lab" />
            {t('lab_title')} · {labCount}
          </p>
          <h1 className="mb-5 font-heading text-h1 font-normal text-cream">{t('lab_title')}</h1>
          <p className="text-lead text-text-muted">{t('lab_subtitle', { count: labCount })}</p>
        </header>

        <WorkGallery projects={projects} />
      </div>
    </div>
  );
}

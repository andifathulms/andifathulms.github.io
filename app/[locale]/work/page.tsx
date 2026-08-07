import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import WorkGallery from '@/components/WorkGallery';
import { getAllProjects } from '@/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'work' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'work' });

  const projects = getAllProjects().filter((p) => p.status !== 'placeholder');

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h1 className="font-heading text-h1 font-medium text-cream mb-4">
            {t('title')}
          </h1>
          <p className="text-text-muted max-w-lg">{t('subtitle')}</p>
        </div>

        {projects.length === 0 ? (
          <p className="text-text-subtle font-mono text-body">
            {/* Placeholder: real projects will be added incrementally */}
            Projects coming soon.
          </p>
        ) : (
          <WorkGallery projects={projects} />
        )}
      </div>
    </div>
  );
}

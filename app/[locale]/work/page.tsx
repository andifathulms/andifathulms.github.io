import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import ProjectCard from '@/components/ProjectCard';
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
          <h1 className="font-heading text-4xl md:text-5xl font-medium text-cream mb-4">
            {t('title')}
          </h1>
          <p className="text-cream/60 max-w-lg">{t('subtitle')}</p>
        </div>

        {projects.length === 0 ? (
          <p className="text-cream/40 font-mono text-sm">
            {/* Placeholder: real projects will be added incrementally */}
            Projects coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                privateBadgeLabel={t('private_badge')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

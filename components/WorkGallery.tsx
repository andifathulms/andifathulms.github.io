'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ProjectMeta } from '@/lib/content';
import ProjectCard from './ProjectCard';

type Filter = 'all' | 'government' | 'independent';

function groupOf(project: ProjectMeta): Exclude<Filter, 'all'> {
  return project.categoryTags.includes('Government') ? 'government' : 'independent';
}

export default function WorkGallery({ projects }: { projects: ProjectMeta[] }) {
  const t = useTranslations('work');
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const gov = projects.filter((p) => groupOf(p) === 'government').length;
    return { all: projects.length, government: gov, independent: projects.length - gov };
  }, [projects]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filter_all') },
    { key: 'government', label: t('filter_government') },
    { key: 'independent', label: t('filter_independent') },
  ];

  const government = projects.filter((p) => groupOf(p) === 'government');
  const independent = projects.filter((p) => groupOf(p) === 'independent');

  const sections =
    filter === 'government'
      ? [{ key: 'government' as const, label: t('filter_government'), items: government }]
      : filter === 'independent'
        ? [{ key: 'independent' as const, label: t('filter_independent'), items: independent }]
        : [
            { key: 'government' as const, label: t('filter_government'), items: government },
            { key: 'independent' as const, label: t('filter_independent'), items: independent },
          ];

  return (
    <>
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-12" role="group" aria-label={t('title')}>
        {filters.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className={`font-mono text-xs px-3.5 py-1.5 rounded border transition-colors ${
                active
                  ? 'border-gold/60 text-gold bg-gold/10'
                  : 'border-cream/15 text-cream/50 hover:border-cream/35 hover:text-cream/80'
              }`}
            >
              {label}
              <span className="ml-1.5 text-cream/30">{counts[key]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-16">
        {sections.map((section) => (
          <section key={section.key} aria-label={section.label}>
            <div className="flex items-baseline gap-3 border-b border-gold/20 pb-3 mb-8">
              <h2 className="font-heading text-xl font-medium text-cream">{section.label}</h2>
              <span className="font-mono text-xs text-cream/30">
                {section.items.length} {t('count_label')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {section.items.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  privateBadgeLabel={t('private_badge')}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

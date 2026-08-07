'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ProjectMeta } from '@/lib/content';
import ProjectCard from './ProjectCard';

type Filter = 'all' | 'government' | 'independent' | 'live';
const VALID: Filter[] = ['all', 'government', 'independent', 'live'];

function groupOf(project: ProjectMeta): 'government' | 'independent' {
  return project.categoryTags.includes('Government') ? 'government' : 'independent';
}

function isLive(project: ProjectMeta): boolean {
  return Boolean(project.liveUrl) && !project.liveIsStaging;
}

export default function WorkGallery({ projects }: { projects: ProjectMeta[] }) {
  const t = useTranslations('work');
  const [filter, setFilter] = useState<Filter>('all');

  // Deep-link support: /work?filter=government (e.g. from the home stat band).
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get('filter');
    if (f && VALID.includes(f as Filter)) setFilter(f as Filter);
  }, []);

  const selectFilter = (f: Filter) => {
    setFilter(f);
    // Keep the URL shareable without a full navigation.
    const qs = f === 'all' ? '' : `?filter=${f}`;
    window.history.replaceState(null, '', window.location.pathname + qs);
  };

  const government = useMemo(() => projects.filter((p) => groupOf(p) === 'government'), [projects]);
  const independent = useMemo(() => projects.filter((p) => groupOf(p) === 'independent'), [projects]);
  const live = useMemo(() => projects.filter(isLive), [projects]);

  const counts: Record<Filter, number> = {
    all: projects.length,
    government: government.length,
    independent: independent.length,
    live: live.length,
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filter_all') },
    { key: 'government', label: t('filter_government') },
    { key: 'independent', label: t('filter_independent') },
    { key: 'live', label: t('filter_live') },
  ];

  const sections =
    filter === 'government'
      ? [{ key: 'government', label: t('filter_government'), items: government }]
      : filter === 'independent'
        ? [{ key: 'independent', label: t('filter_independent'), items: independent }]
        : filter === 'live'
          ? [{ key: 'live', label: t('filter_live'), items: live }]
          : [
              { key: 'government', label: t('filter_government'), items: government },
              { key: 'independent', label: t('filter_independent'), items: independent },
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
              onClick={() => selectFilter(key)}
              aria-pressed={active}
              className={`font-mono text-meta px-3.5 py-1.5 rounded border transition-colors ${
                active
                  ? 'border-gold/60 text-gold bg-gold/10'
                  : 'border-cream/15 text-text-subtle hover:border-cream/35 hover:text-text-muted'
              }`}
            >
              {label}
              <span className="ml-1.5 text-text-subtle">{counts[key]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-16">
        {sections.map((section) => (
          <section key={section.key} aria-label={section.label}>
            <div className="flex items-baseline gap-3 border-b border-gold/20 pb-3 mb-8">
              <h2 className="font-heading text-h3 font-medium text-cream">{section.label}</h2>
              <span className="font-mono text-meta text-text-subtle">
                {section.items.length} {t('count_label')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {section.items.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  privateBadgeLabel={t('private_badge')}
                  liveBadgeLabel={t('live_badge')}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

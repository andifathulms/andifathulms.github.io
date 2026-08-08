'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PROBLEM_SHAPES, isProblemShape, type ProblemShape } from '@/lib/shapes';
import type { ProjectMeta } from '@/lib/content';
import ProjectCard from './ProjectCard';

type Source = 'all' | 'government' | 'independent' | 'live';
const SOURCES: Source[] = ['all', 'government', 'independent', 'live'];

function groupOf(project: ProjectMeta): 'government' | 'independent' {
  return project.categoryTags.includes('Government') ? 'government' : 'independent';
}

function isLive(project: ProjectMeta): boolean {
  return Boolean(project.liveUrl) && !project.liveIsStaging;
}

function matchesSource(project: ProjectMeta, source: Source): boolean {
  if (source === 'all') return true;
  if (source === 'live') return isLive(project);
  return groupOf(project) === source;
}

/**
 * Every term must appear somewhere in the project's own text — title, tagline,
 * tags or stack. AND rather than OR so "django keycloak" narrows instead of
 * widening, and substring rather than fuzzy so a result is always explainable
 * by what the visitor typed. No index to build or keep in sync: the gallery
 * already receives every project's fields as props.
 */
function matchesQuery(project: ProjectMeta, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = [
    project.title,
    project.tagline,
    ...project.categoryTags,
    ...project.techStack,
  ]
    .join(' ')
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={count === 0}
      className={`font-mono text-meta px-3.5 py-1.5 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'border-edge-accent text-gold bg-gold/10'
          : 'border-edge text-text-subtle hover:border-edge-strong hover:text-text-muted'
      }`}
    >
      {children}
      <span className="ml-1.5 text-text-subtle">{count}</span>
    </button>
  );
}

export default function WorkGallery({ projects }: { projects: ProjectMeta[] }) {
  const t = useTranslations('work');
  const [source, setSource] = useState<Source>('all');
  const [shape, setShape] = useState<ProblemShape | null>(null);
  const [query, setQuery] = useState('');

  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );

  // Deep-link support: /work?filter=government&shape=explainer — the stat band
  // and the service cards both land here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    if (f && (SOURCES as string[]).includes(f)) setSource(f as Source);
    const s = params.get('shape');
    if (s && isProblemShape(s)) setShape(s);
    const q = params.get('q');
    if (q) setQuery(q);
  }, []);

  // Keep the URL shareable without a full navigation.
  const syncUrl = (nextSource: Source, nextShape: ProblemShape | null, nextQuery = query) => {
    const params = new URLSearchParams();
    if (nextSource !== 'all') params.set('filter', nextSource);
    if (nextShape) params.set('shape', nextShape);
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
  };

  const selectSource = (next: Source) => {
    setSource(next);
    syncUrl(next, shape);
  };

  // Clicking the active shape clears it — the axes combine, so there has to be
  // a way back to "all problems" without touching the source row.
  const selectShape = (next: ProblemShape) => {
    const value = shape === next ? null : next;
    setShape(value);
    syncUrl(source, value);
  };

  // The About page's stack counts link straight into a search, so the query
  // has to survive in the URL for "Keycloak — 7 systems" to be checkable.
  const updateQuery = (next: string) => {
    setQuery(next);
    syncUrl(source, shape, next);
  };

  const visible = useMemo(
    () =>
      projects.filter(
        (p) =>
          matchesSource(p, source) &&
          (shape === null || p.problemShape === shape) &&
          matchesQuery(p, terms)
      ),
    [projects, source, shape, terms]
  );

  // Each axis counts against the *other* axis's current selection, so a chip
  // never advertises results that clicking it wouldn't produce.
  const sourceCounts = useMemo(() => {
    const pool = projects.filter(
      (p) => (shape === null || p.problemShape === shape) && matchesQuery(p, terms)
    );
    return {
      all: pool.length,
      government: pool.filter((p) => groupOf(p) === 'government').length,
      independent: pool.filter((p) => groupOf(p) === 'independent').length,
      live: pool.filter(isLive).length,
    } as Record<Source, number>;
  }, [projects, shape, terms]);

  const shapeCounts = useMemo(() => {
    const pool = projects.filter((p) => matchesSource(p, source) && matchesQuery(p, terms));
    return Object.fromEntries(
      PROBLEM_SHAPES.map((s) => [s, pool.filter((p) => p.problemShape === s).length])
    ) as Record<ProblemShape, number>;
  }, [projects, source, terms]);

  const filtered = source !== 'all' || shape !== null || terms.length > 0;

  const sections = filtered
    ? [
        {
          key: 'filtered',
          label: shape ? t(`shape_${shape}`) : t(`filter_${source}`),
          items: visible,
        },
      ]
    : [
        {
          key: 'government',
          label: t('filter_government'),
          items: visible.filter((p) => groupOf(p) === 'government'),
        },
        {
          key: 'independent',
          label: t('filter_independent'),
          items: visible.filter((p) => groupOf(p) === 'independent'),
        },
      ];

  return (
    <>
      <div className="mb-12 flex flex-col gap-5">
        {/* Browsing 35 projects by eye has stopped working — let people say
            what they're after. Matches project text only, never the case study
            body, so a hit is always visible on the card that surfaced it. */}
        <div>
          <label htmlFor="work-search" className="sr-only">
            {t('search_label')}
          </label>
          <div className="relative max-w-md">
            <input
              id="work-search"
              type="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              autoComplete="off"
              className="w-full rounded border border-edge bg-navy px-3.5 py-2.5 pr-10 text-body text-cream placeholder:text-text-subtle transition-colors hover:border-edge-strong focus:border-edge-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            />
            {query && (
              <button
                type="button"
                onClick={() => updateQuery('')}
                aria-label={t('search_clear')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 font-mono text-meta text-text-subtle transition-colors hover:text-cream"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Who paid for it */}
        <div>
          <p className="font-mono text-meta uppercase tracking-widest text-text-subtle mb-2.5">
            {t('axis_source')}
          </p>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('axis_source')}>
            {SOURCES.map((key) => (
              <FilterChip
                key={key}
                active={source === key}
                onClick={() => selectSource(key)}
                count={sourceCounts[key]}
              >
                {t(`filter_${key}`)}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* What kind of problem it solves — the axis that cuts across the one above */}
        <div>
          <p className="font-mono text-meta uppercase tracking-widest text-text-subtle mb-2.5">
            {t('axis_shape')}
          </p>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('axis_shape')}>
            {PROBLEM_SHAPES.map((key) => (
              <FilterChip
                key={key}
                active={shape === key}
                onClick={() => selectShape(key)}
                count={shapeCounts[key]}
              >
                {t(`shape_${key}`)}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      {/* Announce result counts to screen readers as the filters narrow. */}
      <p className="sr-only" role="status" aria-live="polite">
        {t('results_count', { count: visible.length, total: projects.length })}
      </p>

      {visible.length === 0 && (
        <div className="border-t border-line pt-8">
          <p className="text-lead text-cream mb-2">{t('no_results')}</p>
          <p className="text-body text-text-muted">{t('no_results_hint')}</p>
        </div>
      )}

      <div className="flex flex-col gap-16">
        {sections
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <section key={section.key} aria-label={section.label}>
              <div className="flex items-baseline gap-3 border-b border-line pb-3 mb-8">
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

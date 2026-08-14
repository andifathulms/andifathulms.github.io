'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PROBLEM_SHAPES, isProblemShape, type ProblemShape } from '@/lib/shapes';
import type { ProjectMeta } from '@/lib/content';
import ProjectCard from './ProjectCard';

// "Live" used to sit inside this same enum, as if it were a fourth category
// alongside Government/Independent — but it's an orthogonal status, not a
// source, and treating it as a peer made "live government work" (arguably
// the single most persuasive filter combination a client could ask for)
// impossible to select. It's now its own toggle (see `liveOnly` below).
type Source = 'all' | 'government' | 'independent';
const SOURCES: Source[] = ['all', 'government', 'independent'];

function groupOf(project: ProjectMeta): 'government' | 'independent' {
  return project.categoryTags.includes('Government') ? 'government' : 'independent';
}

function isLive(project: ProjectMeta): boolean {
  return Boolean(project.liveUrl) && !project.liveIsStaging;
}

function matchesSource(project: ProjectMeta, source: Source): boolean {
  if (source === 'all') return true;
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

const chipClass = (active: boolean, empty: boolean) =>
  `min-h-touch inline-flex items-center font-mono text-meta px-3.5 py-1.5 rounded border transition-colors ${
    empty ? 'opacity-40 cursor-not-allowed' : ''
  } ${
    active
      ? 'border-edge-accent text-gold bg-gold/10'
      : 'border-edge text-text-subtle hover:border-edge-strong hover:text-text-muted'
  }`;

/**
 * The source axis is single-select, so it's a native radio group: the browser
 * conveys "3 of 3" and arrow-key navigation for free, which aria-pressed on
 * independent buttons never could. The input is visually hidden rather than
 * removed, so it stays focusable and the label stays clickable.
 */
function RadioChip({
  name,
  active,
  onSelect,
  children,
  count,
}: {
  name: string;
  active: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  count: number;
}) {
  const empty = count === 0;
  return (
    <label className={chipClass(active, empty)}>
      <input
        type="radio"
        name={name}
        checked={active}
        onChange={onSelect}
        disabled={empty}
        className="sr-only"
      />
      {children}
      <span className="ml-1.5 text-text-subtle">{count}</span>
    </label>
  );
}

/**
 * The shape axis and the live-status toggle both allow more than one active
 * value at once (OR-combined within the axis, AND-combined across axes), so
 * a button with aria-pressed is the right shape here. Empty chips use
 * aria-disabled rather than disabled so they stay reachable and their count
 * is still announced — a keyboard user shouldn't lose information a mouse
 * user keeps.
 */
function ToggleChip({
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
  const empty = count === 0;
  return (
    <button
      type="button"
      onClick={() => !empty && onClick()}
      aria-pressed={active}
      aria-disabled={empty || undefined}
      className={chipClass(active, empty)}
    >
      {children}
      <span className="ml-1.5 text-text-subtle">{count}</span>
    </button>
  );
}

export default function WorkGallery({ projects }: { projects: ProjectMeta[] }) {
  const t = useTranslations('work');
  const [source, setSource] = useState<Source>('all');
  const [liveOnly, setLiveOnly] = useState(false);
  const [shapes, setShapes] = useState<Set<ProblemShape>>(new Set());
  const [query, setQuery] = useState('');

  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );

  // Deep-link support: /work?filter=government&live=1&shape=explainer,tool —
  // the stat band, the service cards, and the About page's stack counts all
  // land here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    if (f && (SOURCES as string[]).includes(f)) setSource(f as Source);
    if (params.get('live') === '1') setLiveOnly(true);
    const s = params.get('shape');
    if (s) {
      const valid = s.split(',').filter(isProblemShape);
      if (valid.length > 0) setShapes(new Set(valid));
    }
    const q = params.get('q');
    if (q) setQuery(q);
  }, []);

  // Keep the URL shareable without a full navigation.
  const syncUrl = (
    nextSource: Source,
    nextLive: boolean,
    nextShapes: Set<ProblemShape>,
    nextQuery = query
  ) => {
    const params = new URLSearchParams();
    if (nextSource !== 'all') params.set('filter', nextSource);
    if (nextLive) params.set('live', '1');
    if (nextShapes.size > 0) params.set('shape', [...nextShapes].join(','));
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
  };

  const selectSource = (next: Source) => {
    setSource(next);
    syncUrl(next, liveOnly, shapes);
  };

  const toggleLive = () => {
    const next = !liveOnly;
    setLiveOnly(next);
    syncUrl(source, next, shapes);
  };

  // Shape is OR-combined within itself (checking "Data platforms" and "Tool"
  // shows either), then AND-combined with source/live/query.
  const toggleShape = (key: ProblemShape) => {
    const next = new Set(shapes);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setShapes(next);
    syncUrl(source, liveOnly, next);
  };

  // The About page's stack counts link straight into a search, so the query
  // has to survive in the URL for "Keycloak — 7 systems" to be checkable.
  const updateQuery = (next: string) => {
    setQuery(next);
    syncUrl(source, liveOnly, shapes, next);
  };

  const visible = useMemo(
    () =>
      projects.filter(
        (p) =>
          matchesSource(p, source) &&
          (!liveOnly || isLive(p)) &&
          (shapes.size === 0 || (p.problemShape !== undefined && shapes.has(p.problemShape))) &&
          matchesQuery(p, terms)
      ),
    [projects, source, liveOnly, shapes, terms]
  );

  // Each axis counts against the *other* axes' current selection, so a chip
  // never advertises results that clicking it wouldn't produce.
  const sourceCounts = useMemo(() => {
    const pool = projects.filter(
      (p) =>
        (!liveOnly || isLive(p)) &&
        (shapes.size === 0 || (p.problemShape !== undefined && shapes.has(p.problemShape))) &&
        matchesQuery(p, terms)
    );
    return {
      all: pool.length,
      government: pool.filter((p) => groupOf(p) === 'government').length,
      independent: pool.filter((p) => groupOf(p) === 'independent').length,
    } as Record<Source, number>;
  }, [projects, liveOnly, shapes, terms]);

  const liveCount = useMemo(() => {
    return projects.filter(
      (p) =>
        matchesSource(p, source) &&
        (shapes.size === 0 || (p.problemShape !== undefined && shapes.has(p.problemShape))) &&
        matchesQuery(p, terms) &&
        isLive(p)
    ).length;
  }, [projects, source, shapes, terms]);

  const shapeCounts = useMemo(() => {
    const pool = projects.filter(
      (p) => matchesSource(p, source) && (!liveOnly || isLive(p)) && matchesQuery(p, terms)
    );
    return Object.fromEntries(
      PROBLEM_SHAPES.map((s) => [s, pool.filter((p) => p.problemShape === s).length])
    ) as Record<ProblemShape, number>;
  }, [projects, source, liveOnly, terms]);

  // The visible count is always current; the sr-only announcement below is
  // debounced separately so a screen reader doesn't read eight counts while
  // someone is still typing "keycloak".
  const summary = t('results_count', { count: visible.length, total: projects.length });
  const [announced, setAnnounced] = useState('');
  useEffect(() => {
    const id = window.setTimeout(() => setAnnounced(summary), 600);
    return () => window.clearTimeout(id);
  }, [summary]);

  const filtered = source !== 'all' || liveOnly || shapes.size > 0 || terms.length > 0;

  // A single active shape (or source, or "live only") gets its own precise
  // label; a query with nothing else active used to fall through to
  // t('filter_all') — literally "All" over a set of search results, which
  // reads as if the search hadn't applied.
  const primaryLabel = (() => {
    if (shapes.size === 1) return t(`shape_${[...shapes][0]}`);
    if (shapes.size > 1) return [...shapes].map((s) => t(`shape_${s}`)).join(' + ');
    if (source !== 'all') return t(`filter_${source}`);
    if (liveOnly) return t('filter_live');
    if (terms.length > 0) return t('search_results');
    return t('filter_all');
  })();
  const label =
    liveOnly && primaryLabel !== t('filter_live')
      ? `${primaryLabel} · ${t('filter_live')}`
      : primaryLabel;

  const sections = filtered
    ? [{ key: 'filtered', label, items: visible }]
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
          {/* Visible, not just announced — a sighted user narrowing a query
              had no numeric feedback until they recounted cards themselves. */}
          <p className="mt-2 font-mono text-meta text-text-subtle" aria-hidden="true">
            {summary}
          </p>
        </div>

        {/* Who paid for it */}
        <div>
          <p className="font-mono text-meta uppercase tracking-widest text-text-subtle mb-2.5">
            {t('axis_source')}
          </p>
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">{t('axis_source')}</legend>
            {SOURCES.map((key) => (
              <RadioChip
                key={key}
                name="work-source"
                active={source === key}
                onSelect={() => selectSource(key)}
                count={sourceCounts[key]}
              >
                {t(`filter_${key}`)}
              </RadioChip>
            ))}
          </fieldset>
        </div>

        {/* Whether it's actually reachable right now — a status, not a
            source, so it toggles independently instead of competing with
            Government/Independent for the same radio group. */}
        <div>
          <p className="font-mono text-meta uppercase tracking-widest text-text-subtle mb-2.5">
            {t('axis_status')}
          </p>
          <div role="group" aria-label={t('axis_status')}>
            <ToggleChip active={liveOnly} onClick={toggleLive} count={liveCount}>
              {t('filter_live')}
            </ToggleChip>
          </div>
        </div>

        {/* What kind of problem it solves — the axis that cuts across the one
            above. Multi-select: checking two shapes shows either, not both
            required, since a visitor comparing categories wants the union. */}
        <div>
          <p className="font-mono text-meta uppercase tracking-widest text-text-subtle mb-2.5">
            {t('axis_shape')}
          </p>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('axis_shape')}>
            {PROBLEM_SHAPES.map((key) => (
              <ToggleChip
                key={key}
                active={shapes.has(key)}
                onClick={() => toggleShape(key)}
                count={shapeCounts[key]}
              >
                {t(`shape_${key}`)}
              </ToggleChip>
            ))}
          </div>
        </div>
      </div>

      {/* role="status" already implies aria-live="polite" and aria-atomic —
          declaring both was duplication. The count is debounced so typing a
          word announces once at the end rather than once per keystroke. */}
      <p className="sr-only" role="status">
        {announced}
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

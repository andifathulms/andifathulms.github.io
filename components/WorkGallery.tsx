'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PROBLEM_SHAPES, isProblemShape, type ProblemShape } from '@/lib/shapes';
import { isLive, trackOf } from '@/lib/project';
import type { ProjectMeta } from '@/lib/content';
import ProjectCard, { LockIcon } from './ProjectCard';
import TrackMark from './TrackMark';

// The lab page opens on the independent projects; "all" exists so a stack
// search can include the government systems that use the same technology.
type Source = 'independent' | 'government' | 'all';
const SOURCES: Source[] = ['independent', 'government', 'all'];
const DEFAULT_SOURCE: Source = 'independent';

type View = 'grid' | 'list';

function matchesSource(project: ProjectMeta, source: Source): boolean {
  if (source === 'all') return true;
  return (trackOf(project) === 'government') === (source === 'government');
}

/**
 * Every term must appear somewhere in the project's own text — title, tagline,
 * tags, stack or skills. AND rather than OR so "django keycloak" narrows
 * instead of widening, and substring rather than fuzzy so a result is always
 * explainable by what the visitor typed.
 */
function matchesQuery(project: ProjectMeta, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = [
    project.title,
    project.tagline,
    ...project.categoryTags,
    ...project.techStack,
    ...(project.skills ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

const chipClass = (active: boolean, empty: boolean) =>
  `min-h-touch inline-flex items-center rounded-control border px-3.5 text-sm transition-colors ${
    empty ? 'opacity-40 cursor-not-allowed' : ''
  } ${
    active
      ? 'border-edge-accent bg-gold/10 text-gold'
      : 'border-line-strong text-text-muted hover:border-edge-strong hover:text-cream'
  }`;

/**
 * The source axis is single-select, so it's a native radio group: the browser
 * conveys "1 of 3" and arrow-key navigation for free. The input is visually
 * hidden rather than removed, so it stays focusable and the label clickable.
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
    <label className={`${chipClass(active, empty)} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold`}>
      <input
        type="radio"
        name={name}
        checked={active}
        onChange={onSelect}
        disabled={empty}
        className="sr-only"
      />
      {children}
      <span className="ml-1.5 font-mono text-xs text-text-subtle">{count}</span>
    </label>
  );
}

/**
 * Shape and live are multi-value (OR within the axis, AND across axes), so
 * they're toggle buttons with aria-pressed. Empty chips use aria-disabled so
 * they stay reachable and their count is still announced.
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
      <span className="ml-1.5 font-mono text-xs text-text-subtle">{count}</span>
    </button>
  );
}

function AxisLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 font-mono text-xs uppercase tracking-widest text-text-subtle">{children}</p>
  );
}

/**
 * Filters live in the URL (/lab?filter=all&q=django&shape=explainer,tool&
 * live=1&view=list), read with useSearchParams and written with
 * history.replaceState, which Next keeps in sync. There is no copy of them in
 * state, so a shared link, the back button and the About page's stack links
 * all land on exactly what the URL says.
 *
 * useSearchParams needs a Suspense boundary under static export. The fallback
 * is the same gallery with no filters, so the prerendered HTML lists every
 * project.
 */
export default function WorkGallery({ projects }: { projects: ProjectMeta[] }) {
  return (
    <Suspense fallback={<GalleryView projects={projects} params={new URLSearchParams()} />}>
      <GalleryFromUrl projects={projects} />
    </Suspense>
  );
}

function GalleryFromUrl({ projects }: { projects: ProjectMeta[] }) {
  const params = useSearchParams();
  return <GalleryView projects={projects} params={params} />;
}

interface ReadableParams {
  get(name: string): string | null;
}

function GalleryView({ projects, params }: { projects: ProjectMeta[]; params: ReadableParams }) {
  const t = useTranslations('work');
  const tc = useTranslations('case_study');

  const f = params.get('filter');
  const source: Source = f && (SOURCES as string[]).includes(f) ? (f as Source) : DEFAULT_SOURCE;
  const liveOnly = params.get('live') === '1';
  const shapeParam = params.get('shape') ?? '';
  const shapes = useMemo(
    () => new Set<ProblemShape>(shapeParam.split(',').filter(isProblemShape)),
    [shapeParam]
  );
  const query = params.get('q') ?? '';
  const view: View = params.get('view') === 'list' ? 'list' : 'grid';

  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );

  const write = (next: Partial<{ source: Source; live: boolean; shapes: Set<ProblemShape>; query: string; view: View }>) => {
    const s = { source, live: liveOnly, shapes, query, view, ...next };
    const out = new URLSearchParams();
    if (s.source !== DEFAULT_SOURCE) out.set('filter', s.source);
    if (s.live) out.set('live', '1');
    if (s.shapes.size > 0) out.set('shape', [...s.shapes].join(','));
    if (s.query) out.set('q', s.query);
    if (s.view === 'list') out.set('view', 'list');
    const qs = out.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
  };

  const selectSource = (next: Source) => write({ source: next });
  const toggleLive = () => write({ live: !liveOnly });
  const toggleShape = (key: ProblemShape) => {
    const next = new Set(shapes);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    write({ shapes: next });
  };
  const updateQuery = (next: string) => write({ query: next });
  const selectView = (next: View) => write({ view: next });

  const matchesShape = (p: ProjectMeta) =>
    shapes.size === 0 || (p.problemShape !== undefined && shapes.has(p.problemShape));

  // Fifty-odd projects: filtering on every render is cheaper than memoising.
  const visible = projects.filter(
    (p) => matchesSource(p, source) && (!liveOnly || isLive(p)) && matchesShape(p) && matchesQuery(p, terms)
  );

  // Each axis counts against the other axes' current selection, so a chip
  // never advertises results that clicking it wouldn't produce.
  const sourcePool = projects.filter((p) => (!liveOnly || isLive(p)) && matchesShape(p) && matchesQuery(p, terms));
  const sourceCounts = Object.fromEntries(
    SOURCES.map((s) => [s, sourcePool.filter((p) => matchesSource(p, s)).length])
  ) as Record<Source, number>;

  const liveCount = projects.filter(
    (p) => matchesSource(p, source) && matchesShape(p) && matchesQuery(p, terms) && isLive(p)
  ).length;

  const shapePool = projects.filter((p) => matchesSource(p, source) && (!liveOnly || isLive(p)) && matchesQuery(p, terms));
  const shapeCounts = Object.fromEntries(
    PROBLEM_SHAPES.map((s) => [s, shapePool.filter((p) => p.problemShape === s).length])
  ) as Record<ProblemShape, number>;

  // Only offer the types that exist in the current track.
  const offeredShapes = PROBLEM_SHAPES.filter(
    (s) => shapes.has(s) || projects.some((p) => matchesSource(p, source) && p.problemShape === s)
  );

  const total = projects.filter((p) => matchesSource(p, source)).length;
  const summary = t('results_count', { count: visible.length, total });
  const [announced, setAnnounced] = useState('');
  useEffect(() => {
    const id = window.setTimeout(() => setAnnounced(summary), 600);
    return () => window.clearTimeout(id);
  }, [summary]);

  const narrowed = liveOnly || shapes.size > 0 || terms.length > 0;

  const typeLabel = (p: ProjectMeta) =>
    p.problemShape ? t(`type_${p.problemShape}`) : t(trackOf(p) === 'government' ? 'track_government' : 'track_lab');

  // Unfiltered, the lab reads best grouped by type and "all" by track. Once
  // the visitor narrows anything, one flat result list is easier to scan.
  const sections: { key: string; label: string; items: ProjectMeta[] }[] = narrowed
    ? [{ key: 'results', label: terms.length > 0 ? t('search_results') : '', items: visible }]
    : source === 'all'
      ? [
          { key: 'government', label: t('track_government'), items: visible.filter((p) => trackOf(p) === 'government') },
          { key: 'lab', label: t('track_lab'), items: visible.filter((p) => trackOf(p) === 'lab') },
        ]
      : source === 'independent'
        ? PROBLEM_SHAPES.map((s) => ({
            key: s,
            label: t(`shape_${s}`),
            items: visible.filter((p) => p.problemShape === s),
          })).sort((a, b) => b.items.length - a.items.length)
        : [{ key: 'government', label: '', items: visible }];

  const statusOf = (p: ProjectMeta) => {
    if (isLive(p)) {
      return p.access === 'internal'
        ? { text: tc('access_internal'), tone: 'muted', lock: true }
        : { text: t('live_badge'), tone: 'live' };
    }
    if (p.liveIsStaging) return { text: t('staging_short'), tone: 'muted' };
    if (p.status === 'private') return { text: t('private_short'), tone: 'muted', lock: true };
    return null;
  };

  return (
    <>
      <div className="mb-12 flex flex-col gap-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-[16rem] flex-1">
            <label htmlFor="work-search" className="sr-only">
              {t('search_label')}
            </label>
            <div className="relative">
              <input
                id="work-search"
                type="search"
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                autoComplete="off"
                className="min-h-touch w-full rounded-control border border-edge bg-navy px-4 py-2.5 pr-10 text-body text-cream placeholder:text-text-subtle transition-colors hover:border-edge-strong focus:border-edge-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateQuery('')}
                  aria-label={t('search_clear')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm text-text-subtle transition-colors hover:text-cream"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="mt-2 font-mono text-xs text-text-subtle" aria-hidden="true">
              {summary}
            </p>
          </div>

          <div role="group" aria-label={t('view_label')} className="flex overflow-hidden rounded-control border border-line-strong">
            {(['grid', 'list'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => selectView(v)}
                className={`min-h-touch px-4 text-sm transition-colors ${
                  view === v ? 'bg-deck-2 text-cream' : 'text-text-muted hover:text-cream'
                }`}
              >
                {t(`view_${v}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-5">
          <div>
            <AxisLabel>{t('axis_source')}</AxisLabel>
            <fieldset className="flex flex-wrap gap-2">
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

          <div>
            <AxisLabel>{t('axis_shape')}</AxisLabel>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('axis_shape')}>
              {offeredShapes.map((key) => (
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

          <div>
            <AxisLabel>{t('axis_status')}</AxisLabel>
            <div role="group" aria-label={t('axis_status')}>
              <ToggleChip active={liveOnly} onClick={toggleLive} count={liveCount}>
                {t('filter_live')}
              </ToggleChip>
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only" role="status">
        {announced}
      </p>

      {visible.length === 0 && (
        <div className="border-t border-line pt-8">
          <p className="mb-2 text-lead text-cream">{t('no_results')}</p>
          <p className="text-body text-text-muted">{t('no_results_hint')}</p>
        </div>
      )}

      <div className="flex flex-col gap-16">
        {sections
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <section key={section.key} aria-label={section.label || summary}>
              {section.label && (
                <div className="mb-8 flex items-baseline gap-3 border-b border-line pb-3">
                  <h2 className="font-heading text-h3 font-normal text-cream">{section.label}</h2>
                  <span className="font-mono text-xs text-text-subtle">
                    {section.items.length} {t('count_label')}
                  </span>
                </div>
              )}

              {view === 'grid' ? (
                <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((project) => (
                    <ProjectCard
                      key={project.slug}
                      project={project}
                      labels={{ type: typeLabel(project), live: t('live_badge'), private: t('private_short') }}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[40rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line-strong text-left font-mono text-xs uppercase tracking-wider text-text-subtle">
                        <th className="py-2.5 pr-4 font-normal">{t('col_project')}</th>
                        <th className="py-2.5 pr-4 font-normal">{t('col_type')}</th>
                        <th className="py-2.5 pr-4 font-normal">{t('col_built')}</th>
                        <th className="py-2.5 font-normal">{t('col_status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((p) => {
                        const status = statusOf(p);
                        return (
                          <tr key={p.slug} className="group border-b border-line transition-colors hover:bg-deck">
                            <td className="py-3 pr-4">
                              <Link href={`/work/${p.slug}`} className="flex items-center gap-3.5">
                                <span className="relative block h-10 w-16 flex-shrink-0 overflow-hidden rounded-md border border-line bg-deck">
                                  {p.heroImage && (
                                    <Image src={p.heroImage} alt="" fill sizes="64px" className="object-cover object-top" />
                                  )}
                                </span>
                                <span className="min-w-0">
                                  <span className="block font-heading text-[1.0625rem] leading-tight text-cream transition-colors group-hover:text-gold">
                                    {p.title}
                                  </span>
                                  <span className="line-clamp-1 block text-text-muted">{p.tagline}</span>
                                </span>
                              </Link>
                            </td>
                            <td className="whitespace-nowrap py-3 pr-4 text-text-muted">
                              <span className="inline-flex items-center gap-2">
                                <TrackMark track={trackOf(p)} />
                                {typeLabel(p)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap py-3 pr-4 font-mono text-xs text-text-muted">{p.timeframe}</td>
                            <td className="whitespace-nowrap py-3">
                              {status && (
                                <span
                                  className={`inline-flex items-center gap-1.5 ${
                                    status.tone === 'live' ? 'text-accent-3' : 'text-text-subtle'
                                  }`}
                                >
                                  {status.tone === 'live' && (
                                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lagoon" />
                                  )}
                                  {status.lock && <LockIcon />}
                                  {status.text}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
      </div>
    </>
  );
}

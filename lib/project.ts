/**
 * Pure helpers over a project manifest. Kept apart from lib/content.ts (which
 * reads the filesystem) so client components — the lab gallery, cards, the
 * search palette — can import them.
 */
import type { ProjectMeta } from './content';

/**
 * The two tracks of work. Government systems live at /work, everything else
 * is the independent lab at /lab. Case studies for both stay at /work/[slug]
 * so no link that has already been shared breaks.
 */
export type Track = 'government' | 'lab';

export function trackOf(project: Pick<ProjectMeta, 'categoryTags'>): Track {
  return project.categoryTags.includes('Government') ? 'government' : 'lab';
}

/** The year a project was built, from the end of its timeframe ("May – Jul 2026"). */
export function yearOf(project: Pick<ProjectMeta, 'timeframe'>): string | null {
  const years = project.timeframe?.match(/\d{4}/g);
  return years ? years[years.length - 1] : null;
}

/** A reachable production deployment. Staging doesn't count. */
export function isLive(project: Pick<ProjectMeta, 'liveUrl' | 'liveIsStaging'>): boolean {
  return Boolean(project.liveUrl) && !project.liveIsStaging;
}

import fs from 'fs';
import path from 'path';

import { PROBLEM_SHAPES, type ProblemShape } from './shapes';
import { isLive, trackOf, yearOf, type Track } from './project';

export { PROBLEM_SHAPES, type ProblemShape, isLive, trackOf, yearOf, type Track };

export interface ProjectMeta {
  slug: string;
  title: string;
  tagline: string;
  categoryTags: string[];
  problemShape?: ProblemShape;
  techStack: string[];
  status: 'active' | 'private' | 'placeholder' | 'archived';
  role?: string;
  timeframe?: string;
  liveUrl: string | null;
  liveIsStaging?: boolean;
  /**
   * Access level of the live URL:
   * - 'public': freely viewable (default when omitted)
   * - 'internal': login wall, nothing visible without credentials
   * - 'registration': login wall, but anyone can self-register
   */
  access?: 'public' | 'internal' | 'registration';
  githubUrl: string | string[] | null;
  heroImage: string;
  /** App/logo icon, auto-detected from public/images/projects/<slug>/icon.*. */
  icon?: string | null;
  /** First few screenshots, used for the card hover-preview carousel. */
  previewImages?: string[];
  order?: number;
  featured?: boolean;
  /** Headline outcomes, impact first (see VOICE.md rule 5). */
  metrics?: { value: string; label: string }[];
  /** The case study's at-a-glance panel: who it's for and what came of it. */
  glance?: { for: string; result: string };
  /** 3–4 skills a recruiter would search for. Not library names. */
  skills?: string[];
  /**
   * Indonesian copy for the fields above. Applied by localizeProject(), so a
   * component always reads `project.tagline` and gets the page's language.
   */
  id?: LocalizedCopy;
}

type LocalizedCopy = Partial<Pick<ProjectMeta, 'tagline' | 'glance' | 'skills' | 'metrics'>>;

/**
 * Overlay a locale's copy onto the English manifest. English is the base
 * language of meta.json; any other locale is a block keyed by its code. A
 * field the block leaves out falls back to English rather than disappearing.
 */
export function localizeProject(project: ProjectMeta, locale?: string): ProjectMeta {
  const { id, ...base } = project;
  if (locale !== 'id') return base;
  const timeframe = base.timeframe?.replace(/\b(May|Aug|Oct|Dec)\b/g, (m) => ID_MONTHS[m]);
  return { ...base, ...id, timeframe };
}

// Timeframes are written as "May – Jul 2026"; only these four abbreviations
// differ in Indonesian.
const ID_MONTHS: Record<string, string> = { May: 'Mei', Aug: 'Agu', Oct: 'Okt', Dec: 'Des' };

/** Every real project on one track, in manifest `order`. */
export function getTrackProjects(track: Track, locale?: string): ProjectMeta[] {
  return getAllProjects(locale).filter(
    (p) => p.status !== 'placeholder' && trackOf(p) === track
  );
}

export interface PortfolioStats {
  total: number;
  government: number;
  independent: number;
  live: number;
}

/**
 * Aggregate, verifiable counts derived from the real project set — no hardcoded
 * marketing numbers, so the home stat band never drifts from the content.
 */
export function getPortfolioStats(): PortfolioStats {
  const projects = getAllProjects().filter((p) => p.status !== 'placeholder');
  const isGov = (p: ProjectMeta) => trackOf(p) === 'government';
  return {
    total: projects.length,
    government: projects.filter(isGov).length,
    independent: projects.filter((p) => !isGov(p)).length,
    live: projects.filter(isLive).length,
  };
}

export interface StackUsage {
  /** Technology name exactly as written in the project manifests. */
  name: string;
  /** How many shipped systems use it. */
  count: number;
}

/**
 * How often each technology actually appears across the portfolio. A logo says
 * "I have heard of Keycloak"; a count says "seven systems depend on it" — and
 * because it derives from the manifests, it can't drift from the case studies.
 */
export function getStackUsage(): StackUsage[] {
  const counts = new Map<string, number>();
  for (const p of getAllProjects().filter((p) => p.status !== 'placeholder')) {
    for (const tech of p.techStack) counts.set(tech, (counts.get(tech) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects');

/** Look for an app icon at public/images/projects/<slug>/icon.{svg,png,webp,jpg,jpeg}. */
export function getProjectIcon(slug: string): string | null {
  const dir = path.join(process.cwd(), 'public', 'images', 'projects', slug);
  for (const ext of ['svg', 'png', 'webp', 'jpg', 'jpeg']) {
    if (fs.existsSync(path.join(dir, `icon.${ext}`))) {
      return `/images/projects/${slug}/icon.${ext}`;
    }
  }
  return null;
}

export function getAllProjects(locale?: string): ProjectMeta[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  const dirs = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => fs.statSync(path.join(PROJECTS_DIR, f)).isDirectory());

  const projects = dirs
    .map((slug) => {
      const metaPath = path.join(PROJECTS_DIR, slug, 'meta.json');
      if (!fs.existsSync(metaPath)) return null;
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      return localizeProject(
        {
          ...meta,
          slug,
          icon: getProjectIcon(slug),
          previewImages: getProjectScreenshots(slug).slice(0, 4).map((s) => s.src),
        } as ProjectMeta,
        locale
      );
    })
    .filter((p): p is ProjectMeta => p !== null);

  return projects.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

// Curated display sequence for the featured strip — independent of the global
// `order` field that drives the work grid. Without this the strip renders in
// `order`, which front-loads the three government workflows and buries the
// most visual independent builds (orders 33/35/36) at the very end. This
// alternates employer and problem-shape so the set opens strong. Any featured
// project not named here falls back to after the listed ones, by `order`.
const FEATURED_ORDER = [
  'climate-watch', // indep · data
  'falak-visualizer', // indep · tool
  'aksara', // gov · workflow
  'jdih', // gov · workflow
  'lantara', // gov · workflow
  'nusantara-languages', // indep · data
  'scimotion', // indep · explainer
  'doserx', // indep · tool
  'anatomi-rupiah', // indep · explainer
  'quranlytics', // indep · data
  'gempa-watch', // indep · data
  'zero-shadow-day', // indep · explainer
  'pola-hujan', // indep · explainer
  'cubiq', // indep · tool
];

export function getFeaturedProjects(limit = 3, locale?: string): ProjectMeta[] {
  const rank = (slug: string) => {
    const i = FEATURED_ORDER.indexOf(slug);
    return i === -1 ? FEATURED_ORDER.length : i;
  };
  return getAllProjects(locale)
    .filter((p) => p.featured && p.status !== 'placeholder')
    .sort((a, b) => rank(a.slug) - rank(b.slug) || (a.order ?? 99) - (b.order ?? 99))
    .slice(0, limit);
}

export function getProjectMeta(slug: string, locale?: string): ProjectMeta | null {
  const metaPath = path.join(PROJECTS_DIR, slug, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  return localizeProject({ ...meta, slug, icon: getProjectIcon(slug) }, locale);
}

export function getProjectContent(slug: string, locale: string): string | null {
  const filePath = path.join(PROJECTS_DIR, slug, `${locale}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  // Case study MDX conventionally opens with "# Title", but the hero banner
  // above already renders the title — strip it here so it isn't duplicated.
  return raw.replace(/^#\s+.+\n+/, '');
}

/** The heading that opens a case study's collapsible technical section, per locale (VOICE.md). */
export const HOOD_HEADINGS: Record<string, string> = {
  en: 'Under the hood',
  id: 'Di balik layar',
};

/**
 * Split case study MDX into the part everyone reads and the "Under the hood"
 * section, which the page renders collapsed. The heading line itself is
 * dropped; the page supplies its own summary.
 */
export function splitUnderTheHood(mdx: string): { main: string; hood: string | null } {
  const headings = Object.values(HOOD_HEADINGS).join('|');
  const match = new RegExp(`^##\\s+(?:${headings})\\s*$`, 'm').exec(mdx);
  if (!match) return { main: mdx, hood: null };
  const hood = mdx.slice(match.index + match[0].length).trim();
  return { main: mdx.slice(0, match.index).trimEnd(), hood: hood || null };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface TocItem {
  level: 2 | 3;
  text: string;
  slug: string;
}

/** Pull h2/h3 headings from MDX source for the table of contents (skips code fences). */
export function extractHeadings(mdx: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;
  for (const raw of mdx.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.*)$/.exec(line);
    if (m) {
      const level = m[1].length as 2 | 3;
      const text = m[2].replace(/[*_`]/g, '').trim();
      items.push({ level, text, slug: slugify(text) });
    }
  }
  return items;
}

/** Rough reading-time estimate at ~200 words/min. */
export function readingTimeMinutes(mdx: string): number {
  const words = mdx.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function getAllProjectSlugs(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => fs.statSync(path.join(PROJECTS_DIR, f)).isDirectory());
}

export interface ProjectScreenshot {
  src: string;
  caption: string;
}

export function getProjectScreenshots(slug: string): ProjectScreenshot[] {
  const screenshotsDir = path.join(process.cwd(), 'public', 'images', 'projects', slug, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) return [];

  const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);
  return fs
    .readdirSync(screenshotsDir)
    .filter((f) => exts.has(path.extname(f).toLowerCase()) && !f.startsWith('.'))
    .sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    })
    .map((filename) => {
      const nameWithoutExt = path.basename(filename, path.extname(filename));
      // "1_Beranda" → "Beranda", "Dashboard Admin" stays as-is
      const caption = nameWithoutExt.replace(/^\d+[_\s-]+/, '');
      return {
        src: `/images/projects/${slug}/screenshots/${filename}`,
        caption,
      };
    });
}

/**
 * Previous / next within the same track, so reading through the government
 * systems doesn't drop the reader into a browser game halfway.
 */
export function getAdjacentProjects(
  currentSlug: string,
  locale?: string
): { prev: ProjectMeta | null; next: ProjectMeta | null } {
  const current = getProjectMeta(currentSlug);
  const all = current
    ? getTrackProjects(trackOf(current), locale)
    : getAllProjects(locale).filter((p) => p.status !== 'placeholder');
  const index = all.findIndex((p) => p.slug === currentSlug);
  return {
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}

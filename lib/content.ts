import fs from 'fs';
import path from 'path';

export interface ProjectMeta {
  slug: string;
  title: string;
  tagline: string;
  categoryTags: string[];
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
  order?: number;
  featured?: boolean;
  /** Optional headline outcomes shown near the top of the case study. */
  metrics?: { value: string; label: string }[];
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
  const isGov = (p: ProjectMeta) => p.categoryTags.includes('Government');
  return {
    total: projects.length,
    government: projects.filter(isGov).length,
    independent: projects.filter((p) => !isGov(p)).length,
    live: projects.filter((p) => p.liveUrl && !p.liveIsStaging).length,
  };
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

export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  const dirs = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => fs.statSync(path.join(PROJECTS_DIR, f)).isDirectory());

  const projects = dirs
    .map((slug) => {
      const metaPath = path.join(PROJECTS_DIR, slug, 'meta.json');
      if (!fs.existsSync(metaPath)) return null;
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      return { ...meta, slug, icon: getProjectIcon(slug) } as ProjectMeta;
    })
    .filter((p): p is ProjectMeta => p !== null);

  return projects.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getFeaturedProjects(limit = 3): ProjectMeta[] {
  return getAllProjects()
    .filter((p) => p.featured && p.status !== 'placeholder')
    .slice(0, limit);
}

export function getProjectMeta(slug: string): ProjectMeta | null {
  const metaPath = path.join(PROJECTS_DIR, slug, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  return { ...meta, slug, icon: getProjectIcon(slug) };
}

export function getProjectContent(slug: string, locale: string): string | null {
  const filePath = path.join(PROJECTS_DIR, slug, `${locale}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  // Case study MDX conventionally opens with "# Title", but the hero banner
  // above already renders the title — strip it here so it isn't duplicated.
  return raw.replace(/^#\s+.+\n+/, '');
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

export function getAdjacentProjects(
  currentSlug: string
): { prev: ProjectMeta | null; next: ProjectMeta | null } {
  const all = getAllProjects().filter((p) => p.status !== 'placeholder');
  const index = all.findIndex((p) => p.slug === currentSlug);
  return {
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}

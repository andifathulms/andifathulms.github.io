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
  githubUrl: string | string[] | null;
  heroImage: string;
  order?: number;
  featured?: boolean;
}

const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects');

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
      return { ...meta, slug } as ProjectMeta;
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
  return { ...meta, slug };
}

export function getProjectContent(slug: string, locale: string): string | null {
  const filePath = path.join(PROJECTS_DIR, slug, `${locale}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
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

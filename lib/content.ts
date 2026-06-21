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
  githubUrl: string | null;
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

export function getFeaturedProjects(): ProjectMeta[] {
  return getAllProjects().filter((p) => p.featured && p.status !== 'placeholder');
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

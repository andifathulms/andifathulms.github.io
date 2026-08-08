import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getAllProjects } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

// Static export emits this as /sitemap.xml at build time.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/work', '/about', '/contact'];
  const projectPaths = getAllProjects()
    .filter((p) => p.status !== 'placeholder')
    .map((p) => `/work/${p.slug}`);

  const allPaths = [...staticPaths, ...projectPaths];

  // trailingSlash: true is set in next.config — keep URLs consistent with it.
  const url = (locale: string, p: string) =>
    `${SITE_URL}/${locale}${p}`.replace(/\/?$/, '/');

  return allPaths.flatMap((p) =>
    routing.locales.map((locale) => ({
      url: url(locale, p),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: p === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, url(l, p)])
        ),
      },
    }))
  );
}

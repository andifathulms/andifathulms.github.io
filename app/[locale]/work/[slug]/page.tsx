import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Link } from '@/i18n/navigation';
import {
  getAllProjectSlugs,
  getProjectMeta,
  getProjectContent,
  getAdjacentProjects,
  getProjectScreenshots,
  extractHeadings,
  readingTimeMinutes,
  slugify,
} from '@/lib/content';
import { routing } from '@/i18n/routing';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import QuickFactsStrip from '@/components/QuickFactsStrip';
import MetricsStrip from '@/components/MetricsStrip';
import ReadingProgress from '@/components/ReadingProgress';
import CaseStudyToc from '@/components/CaseStudyToc';
import TechStackChips from '@/components/TechStackChips';
import ScreenshotGallery from '@/components/ScreenshotGallery';

// Flatten heading children to a string so the anchor id matches the TOC slug.
function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return nodeText((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

const mdxComponents = {
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 id={slugify(nodeText(children))}>{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 id={slugify(nodeText(children))}>{children}</h3>
  ),
};

export function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = getProjectMeta(slug);
  if (!project) return {};

  // heroImage is a root-relative path; metadataBase (set in the locale layout)
  // resolves it to an absolute URL for social cards.
  const image = project.heroImage || '/og.png';
  return {
    title: project.title,
    description: project.tagline,
    alternates: {
      canonical: `/${locale}/work/${slug}`,
    },
    openGraph: {
      type: 'article',
      title: `${project.title} — ${SITE_NAME}`,
      description: project.tagline,
      url: `${SITE_URL}/${locale}/work/${slug}`,
      images: [{ url: image, width: 1200, height: 630, alt: project.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — ${SITE_NAME}`,
      description: project.tagline,
      images: [image],
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const project = getProjectMeta(slug);
  if (!project) notFound();

  const content = getProjectContent(slug, locale) ?? getProjectContent(slug, 'en');
  if (!content) notFound();

  const t = await getTranslations({ locale, namespace: 'case_study' });
  const { prev, next } = getAdjacentProjects(slug);
  const screenshots = getProjectScreenshots(slug);
  const toc = extractHeadings(content);
  const readingMinutes = readingTimeMinutes(content);

  return (
    <article className="pt-28 pb-8">
      <ReadingProgress />
      {/* Hero banner */}
      <div className="relative aspect-video md:aspect-[21/6] bg-navy/50 mb-0 overflow-hidden">
        {project.heroImage && (
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            className="object-cover opacity-60"
            priority
          />
        )}
        {/* gradient scrim so text is always legible regardless of image brightness */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/20" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10">
          <div className="max-w-5xl mx-auto w-full">
            {project.icon && (
              <Image
                src={project.icon}
                alt=""
                aria-hidden="true"
                width={56}
                height={56}
                className="mb-4 h-12 w-12 md:h-14 md:w-14 rounded-xl border border-cream/15 object-cover"
              />
            )}
            {/* Category tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.categoryTags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-meta text-accent-2 border border-clay/30 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-heading text-h1 font-medium text-cream mb-2">
              {project.title}
            </h1>
            <p className="text-text-muted text-lead">{project.tagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Back to work index + reading time */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <Link
            href="/work"
            className="group inline-flex items-center gap-1.5 font-mono text-meta text-text-subtle hover:text-gold transition-colors"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            {t('all_projects')}
          </Link>
          <span className="font-mono text-meta text-text-subtle">
            {t('min_read', { min: readingMinutes })}
          </span>
        </div>

        {/* Quick facts */}
        <QuickFactsStrip project={project} />

        {/* Outcomes — only renders when meta.json declares metrics */}
        {project.metrics && project.metrics.length > 0 && (
          <MetricsStrip metrics={project.metrics} label={t('results_label')} />
        )}

        {/* Body + sticky table of contents */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
          <div className="prose-case-study max-w-2xl">
            <MDXRemote source={content} components={mdxComponents} />
          </div>
          {toc.length > 1 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <CaseStudyToc items={toc} label={t('on_this_page')} />
              </div>
            </aside>
          )}
        </div>

        {/* Screenshots gallery */}
        {screenshots.length > 0 && (
          <ScreenshotGallery screenshots={screenshots} label={t('screenshots')} />
        )}

        {/* Full tech stack */}
        <div className="border-t border-gold/20 mt-16 pt-8">
          <p className="font-mono text-meta text-accent uppercase tracking-wider mb-3">
            {t('stack')}
          </p>
          <TechStackChips stack={project.techStack} maxVisible={20} size="md" />
        </div>

        {/* Conversion CTA */}
        <section className="border-t border-gold/20 mt-16 pt-12 text-center">
          <h2 className="font-heading text-h2 font-medium text-cream mb-3">
            {t('cta_title')}
          </h2>
          <p className="text-text-muted mb-6 max-w-md mx-auto">{t('cta_body')}</p>
          <Link
            href="/contact"
            className="inline-block px-7 py-3 bg-gold text-navy text-sm font-medium rounded hover:bg-gold/90 transition-colors"
          >
            {t('cta_button')}
          </Link>
        </section>

        {/* Next / prev navigation */}
        {(prev || next) && (
          <nav className="border-t border-gold/20 mt-16 pt-10 flex justify-between gap-8">
            {prev ? (
              <Link
                href={`/work/${prev.slug}`}
                className="group flex flex-col gap-1 max-w-xs"
              >
                <span className="font-mono text-meta text-text-subtle">{t('prev_project')}</span>
                <span className="font-heading text-lead text-cream group-hover:text-gold transition-colors inline-flex items-center gap-2">
                  <span className="transition-transform group-hover:-translate-x-0.5">←</span>
                  {prev.icon && (
                    <Image
                      src={prev.icon}
                      alt=""
                      aria-hidden="true"
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-md border border-cream/15 object-cover"
                    />
                  )}
                  {prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next && (
              <Link
                href={`/work/${next.slug}`}
                className="group flex flex-col gap-1 max-w-xs text-right ml-auto"
              >
                <span className="font-mono text-meta text-text-subtle">{t('next_project')}</span>
                <span className="font-heading text-lead text-cream group-hover:text-gold transition-colors inline-flex items-center gap-2 justify-end">
                  {next.icon && (
                    <Image
                      src={next.icon}
                      alt=""
                      aria-hidden="true"
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-md border border-cream/15 object-cover"
                    />
                  )}
                  {next.title}
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}

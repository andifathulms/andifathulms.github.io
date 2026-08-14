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
import { routeMetadata } from '@/lib/site';
import QuickFactsStrip from '@/components/QuickFactsStrip';
import PrintButton from '@/components/PrintButton';
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
  //
  // This used to build `alternates` and `openGraph` by hand, and because those
  // objects replace rather than merge, every case study lost the layout's
  // hreflang languages and og:locale — 70 pages with no link between their
  // English and Indonesian versions.
  return routeMetadata({
    locale,
    path: `/work/${slug}`,
    title: project.title,
    description: project.tagline,
    image: project.heroImage || '/og.png',
    type: 'article',
  });
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
  const ta = await getTranslations({ locale, namespace: 'a11y' });
  const { prev, next } = getAdjacentProjects(slug);
  const screenshots = getProjectScreenshots(slug);
  const toc = extractHeadings(content);
  const readingMinutes = readingTimeMinutes(content);

  return (
    <article className="pt-page-top pb-8">
      <ReadingProgress />
      {/* Hero banner */}
      {/* The banner used to be a fixed aspect-ratio box with the title block
          absolutely positioned inside it and overflow-hidden. At 320px, or at
          200% zoom, the icon + tags + h1 + tagline needed more height than the
          box had, and the excess was clipped (1.4.4 / 1.4.10). The content is
          in normal flow now and sets the height; the image sits behind it, so
          the banner can grow instead of cropping the title. */}
      <div className="relative min-h-[12rem] md:min-h-[16rem] bg-navy/50 overflow-hidden">
        {project.heroImage && (
          <Image
            src={project.heroImage}
            alt=""
            aria-hidden="true"
            fill
            className="object-cover object-top opacity-40"
            priority
          />
        )}
        {/* Flat scrim. PRD §4 and CLAUDE.md both commit to "no gradients —
            flat surfaces", and this banner held the only bg-gradient-* in the
            repo. A single opacity darkens the whole image evenly, which is
            what the title needed anyway: the previous gradient was weakest
            exactly where the screenshot's own headline sits. */}
        <div className="absolute inset-0 bg-navy/80" />
        <div className="relative flex min-h-[12rem] md:min-h-[16rem] flex-col justify-end px-gutter pt-10 pb-10">
          <div className="max-w-page mx-auto w-full">
            {project.icon && (
              <Image
                src={project.icon}
                alt=""
                aria-hidden="true"
                width={56}
                height={56}
                className="mb-4 h-12 w-12 md:h-14 md:w-14 rounded-lg border border-edge object-cover"
              />
            )}
            {/* Category tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.categoryTags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-meta text-accent-2 border border-line-muted px-2 py-0.5 rounded"
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

      <div className="max-w-page mx-auto px-gutter">
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
        {/* Print sits at the right end of the action row — for the reader who
            forwards this case study to a decision-maker. */}
        <QuickFactsStrip project={project} action={<PrintButton label={ta('print')} />} />

        {/* Collapsed table of contents below the desktop breakpoint — the
            sticky sidebar version disappears entirely under lg:, leaving a
            multi-heading read with zero wayfinding on exactly the viewport
            most likely to receive this page (forwarded via the print/share
            action above). No scroll-spy needed here: it's a one-time jump
            list, not a persistent sidebar. */}
        {toc.length > 1 && (
          <details className="lg:hidden mb-8 border border-edge rounded px-4 py-3">
            <summary className="font-mono text-meta text-accent uppercase tracking-wider cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
              {t('on_this_page')}
            </summary>
            <ul className="mt-3 border-l border-line">
              {toc.map((item) => (
                <li key={item.slug}>
                  <a
                    href={`#${item.slug}`}
                    className={`-ml-px block border-l border-transparent py-1 text-sm text-text-muted hover:text-cream transition-colors ${
                      item.level === 3 ? 'pl-6' : 'pl-3'
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Body + sticky table of contents */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
          <div className="prose-case-study max-w-prose">
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

        {/* Outcomes — only renders when meta.json declares metrics. Placed
            after the prose rather than before it: the numbers ("12 → 4")
            were unreadable without the vocabulary the write-up itself
            establishes, so the payoff now lands once the reader has it. */}
        {project.metrics && project.metrics.length > 0 && (
          <MetricsStrip metrics={project.metrics} label={t('results_label')} />
        )}

        {/* Screenshots gallery */}
        {screenshots.length > 0 && (
          <ScreenshotGallery screenshots={screenshots} label={t('screenshots')} />
        )}

        {/* Full tech stack */}
        <div className="border-t border-line mt-16 pt-8">
          <p className="font-mono text-meta text-accent uppercase tracking-wider mb-3">
            {t('stack')}
          </p>
          <TechStackChips stack={project.techStack} maxVisible={20} size="md" linked />
        </div>

        {/* Conversion CTA */}
        <section className="border-t border-line mt-16 pt-12 text-center">
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
          <nav className="border-t border-line mt-16 pt-10 flex justify-between gap-8">
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
                      className="h-6 w-6 rounded-lg border border-edge object-cover"
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
                      className="h-6 w-6 rounded-lg border border-edge object-cover"
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

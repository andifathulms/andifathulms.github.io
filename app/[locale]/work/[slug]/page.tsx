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
  splitUnderTheHood,
  trackOf,
} from '@/lib/content';
import { routing } from '@/i18n/routing';
import { routeMetadata } from '@/lib/site';
import AtAGlance from '@/components/AtAGlance';
import PrintButton from '@/components/PrintButton';
import TrackMark from '@/components/TrackMark';
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
  const project = getProjectMeta(slug, locale);
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

  const project = getProjectMeta(slug, locale);
  if (!project) notFound();

  const content = getProjectContent(slug, locale) ?? getProjectContent(slug, 'en');
  if (!content) notFound();
  const { main, hood } = splitUnderTheHood(content);

  const t = await getTranslations({ locale, namespace: 'case_study' });
  const ta = await getTranslations({ locale, namespace: 'a11y' });
  const tw = await getTranslations({ locale, namespace: 'work' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const { prev, next } = getAdjacentProjects(slug, locale);
  const screenshots = getProjectScreenshots(slug);
  const track = trackOf(project);
  const HOOD_ID = 'under-the-hood';
  const toc = [
    ...extractHeadings(main),
    ...(hood ? [{ level: 2 as const, text: t('under_the_hood'), slug: HOOD_ID }] : []),
  ];
  // Reading time covers what everyone reads; the collapsed section is extra.
  const readingMinutes = readingTimeMinutes(main);
  const indexHref = track === 'government' ? '/work' : '/lab';
  const heroSrc = project.heroImage || screenshots[0]?.src;

  return (
    <article className="pt-page-top pb-8">
      <ReadingProgress />
      <div className="mx-auto max-w-page px-gutter">
        {/* Title block. The old banner put the screenshot behind an 80% navy
            scrim, which hid the one thing that proves the work exists; the
            screenshot now sits in full view beside the at-a-glance panel. */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-between gap-4 text-sm">
          <Link
            href={indexHref}
            className="group inline-flex min-h-touch items-center gap-2 text-text-muted transition-colors hover:text-cream"
          >
            <span aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">←</span>
            <TrackMark track={track} />
            {track === 'government' ? tn('work') : tn('lab')}
            {project.problemShape && (
              <span className="text-text-subtle">/ {tw(`type_${project.problemShape}`)}</span>
            )}
          </Link>
          <span className="font-mono text-xs text-text-subtle">{t('min_read', { min: readingMinutes })}</span>
        </nav>

        <header className="mb-10 max-w-4xl">
          <h1 className="mb-4 flex items-center gap-4 font-heading text-h1 font-normal tracking-[-0.025em] text-cream">
            {project.icon && (
              <Image
                src={project.icon}
                alt=""
                aria-hidden="true"
                width={56}
                height={56}
                className="h-12 w-12 flex-shrink-0 rounded-xl border border-line object-cover md:h-14 md:w-14"
              />
            )}
            {project.title}
          </h1>
          <p className="max-w-3xl text-lead text-text-muted">{project.tagline}</p>
        </header>

        <div className="mb-6 grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
          {heroSrc && (
            <div className="relative aspect-[16/10] overflow-hidden rounded-media border border-line-strong bg-deck">
              <Image
                src={heroSrc}
                alt={t('screenshots')}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 660px"
                className="object-cover object-top"
              />
            </div>
          )}
          <AtAGlance project={project} />
        </div>

        {project.metrics && project.metrics.length > 0 && (
          <div className="mb-16">
            <MetricsStrip metrics={project.metrics} label={t('results_label')} />
          </div>
        )}

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
          <div className="max-w-prose">
            <div className="prose-case-study">
              <MDXRemote source={main} components={mdxComponents} />
            </div>

            {/* Technical detail for engineers, collapsed so the case study
                reads in three minutes for everyone else (VOICE.md rule 6). */}
            {hood && (
              <details id={HOOD_ID} className="group mt-14 scroll-mt-24 rounded-media border border-line bg-deck">
                <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 rounded-media px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block font-heading text-h3 text-cream">{t('under_the_hood')}</span>
                    <span className="text-sm text-text-muted">{t('under_the_hood_hint')}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-xl text-gold transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <div className="prose-case-study border-t border-line px-5 pb-2 pt-5 text-[0.9375rem]">
                  <MDXRemote source={hood} components={mdxComponents} />
                </div>
              </details>
            )}
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
        <div className="border-t border-line mt-16 pt-8">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-text-subtle">
            {t('stack')}
          </p>
          <TechStackChips stack={project.techStack} maxVisible={20} size="md" linked />
        </div>

        {/* Conversion CTA — for a recruiter as much as a client. */}
        <section className="mt-16 flex flex-col items-start gap-6 rounded-media border border-line bg-deck p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-2 font-heading text-h2 font-normal text-cream">{t('cta_title')}</h2>
            <p className="text-text-muted">{t('cta_body')}</p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-touch items-center rounded-control bg-gold px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-gold/90"
            >
              {t('cta_button')}
            </Link>
            <Link
              href="/cv"
              className="inline-flex min-h-touch items-center rounded-control border border-edge px-5 py-3 text-sm font-medium text-cream transition-colors hover:border-edge-strong"
            >
              {t('cta_cv')}
            </Link>
            <PrintButton label={ta('print')} />
          </div>
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

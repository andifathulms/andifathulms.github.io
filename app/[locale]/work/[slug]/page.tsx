import { notFound } from 'next/navigation';
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
} from '@/lib/content';
import { routing } from '@/i18n/routing';
import QuickFactsStrip from '@/components/QuickFactsStrip';
import TechStackChips from '@/components/TechStackChips';
import ScreenshotGallery from '@/components/ScreenshotGallery';

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

  const t = await getTranslations({ locale, namespace: 'case_study' });
  return {
    title: project.title,
    description: project.tagline,
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

  return (
    <article className="pt-28 pb-24">
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
            {/* Category tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.categoryTags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs text-clay/80 border border-clay/30 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-medium text-cream mb-2">
              {project.title}
            </h1>
            <p className="text-cream/70 text-lg">{project.tagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Quick facts */}
        <QuickFactsStrip project={project} />

        {/* MDX content */}
        <div className="prose-case-study max-w-2xl">
          <MDXRemote source={content} />
        </div>

        {/* Screenshots gallery */}
        {screenshots.length > 0 && (
          <ScreenshotGallery screenshots={screenshots} label={t('screenshots')} />
        )}

        {/* Full tech stack */}
        <div className="border-t border-gold/20 mt-16 pt-8">
          <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-3">
            {t('stack')}
          </p>
          <TechStackChips stack={project.techStack} maxVisible={20} size="md" />
        </div>

        {/* Next / prev navigation */}
        {(prev || next) && (
          <nav className="border-t border-gold/20 mt-16 pt-10 flex justify-between gap-8">
            {prev ? (
              <Link
                href={`/work/${prev.slug}`}
                className="group flex flex-col gap-1 max-w-xs"
              >
                <span className="font-mono text-xs text-cream/30">{t('prev_project')}</span>
                <span className="font-heading text-base text-cream group-hover:text-gold transition-colors">
                  ← {prev.title}
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
                <span className="font-mono text-xs text-cream/30">{t('next_project')}</span>
                <span className="font-heading text-base text-cream group-hover:text-gold transition-colors">
                  {next.title} →
                </span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}

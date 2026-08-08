import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import Hero from '@/components/Hero';
import IdentityAnchor from '@/components/IdentityAnchor';
import ServiceCard from '@/components/ServiceCard';
import ProjectCard from '@/components/ProjectCard';
import ProcessSection from '@/components/ProcessSection';
import SectionHeading from '@/components/SectionHeading';
import { getFeaturedProjects, getPortfolioStats } from '@/lib/content';
import { routeMetadata, SITE_NAME } from '@/lib/site';
import type { PortfolioStats } from '@/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.hero' });
  return routeMetadata({
    locale,
    path: '',
    title: SITE_NAME,
    description: t('subheadline'),
  });
}

function ServicesSection({ stats }: { stats: PortfolioStats }) {
  const t = useTranslations('home.services');

  // The counts come from the content, not the copy, so a service claim can
  // never drift from the case studies that back it.
  const items = [0, 1, 2, 3].map((i) => ({
    title: t(`items.${i}.title`),
    description: t(`items.${i}.description`, {
      government: stats.government,
      total: stats.total,
      live: stats.live,
    }),
    href: t(`items.${i}.href`),
  }));

  return (
    <section className="reveal border-t border-line py-section-tight px-gutter">
      <div className="max-w-page mx-auto">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} className="mb-stack" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {items.map((item) => (
            <ServiceCard
              key={item.title}
              title={item.title}
              description={item.description}
              href={item.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedWorkSection({ projects }: { projects: ReturnType<typeof getFeaturedProjects> }) {
  const t = useTranslations('home.featured_work');
  const tw = useTranslations('work');

  if (projects.length === 0) return null;

  return (
    <section className="reveal border-t border-line py-section px-gutter">
      <div className="max-w-page mx-auto">
        <div className="flex items-end justify-between mb-stack">
          <SectionHeading tone="primary" title={t('title')} subtitle={t('subtitle')} />
          <Link
            href="/work"
            className="hidden md:block text-sm text-accent hover:text-cream transition-colors whitespace-nowrap"
          >
            {t('view_all')} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              privateBadgeLabel={tw('private_badge')}
              liveBadgeLabel={tw('live_badge')}
            />
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link href="/work" className="text-sm text-accent hover:text-cream transition-colors">
            {t('view_all')} →
          </Link>
        </div>
      </div>
    </section>
  );
}


function CtaSection() {
  const t = useTranslations('home.cta');

  return (
    <section className="reveal border-t border-line py-section px-gutter">
      <div className="max-w-page mx-auto text-center">
        <SectionHeading
          tone="primary"
          align="center"
          title={t('title')}
          subtitle={t('subtitle')}
          className="mb-stack"
        />
        <Link
          href="/contact"
          className="inline-block px-8 py-3 bg-gold text-navy text-sm font-medium rounded hover:bg-gold/90 transition-colors"
        >
          {t('button')}
        </Link>
      </div>
    </section>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const featuredProjects = getFeaturedProjects(6);
  const stats = getPortfolioStats();

  return (
    <>
      {/* Evidence before adjectives: the work answers "is this person any
          good" faster than the services grid or the bio can. */}
      <Hero stats={stats} />
      <FeaturedWorkSection projects={featuredProjects} />
      <IdentityAnchor />
      <ServicesSection stats={stats} />
      <ProcessSection />
      <CtaSection />
    </>
  );
}

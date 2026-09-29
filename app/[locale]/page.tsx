import { existsSync } from 'fs';
import path from 'path';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import Hero from '@/components/Hero';
import FlagshipRow, { FlagshipMini } from '@/components/FlagshipRow';
import LabShelf, { type ShelfGroup } from '@/components/LabShelf';
import ProcessSection from '@/components/ProcessSection';
import StackUsageList from '@/components/StackUsageList';
import TrackMark from '@/components/TrackMark';
import {
  getPortfolioStats,
  getStackUsage,
  getTrackProjects,
  PROBLEM_SHAPES,
} from '@/lib/content';
import { CONTACT, routeMetadata, SITE_NAME } from '@/lib/site';

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

function SectionIntro({
  kicker,
  track,
  title,
  subtitle,
  action,
}: {
  kicker: string;
  track?: 'government' | 'lab';
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-stack flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        <p className="mb-4 inline-flex items-center gap-2.5 font-mono text-meta uppercase tracking-wider text-text-subtle">
          {track && <TrackMark track={track} />}
          {kicker}
        </p>
        <h2 className="mb-3 font-heading text-h2 font-normal text-cream">{title}</h2>
        <p className="text-lead text-text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-touch items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-cream"
    >
      {children}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'home' });
  const tw = await getTranslations({ locale, namespace: 'work' });
  const tc = await getTranslations({ locale, namespace: 'case_study' });
  const ta = await getTranslations({ locale, namespace: 'about' });

  const stats = getPortfolioStats();
  const government = getTrackProjects('government', locale);
  const lab = getTrackProjects('lab', locale);
  const [lead, ...rest] = government;
  const stack = getStackUsage().filter((s) => s.count > 1).slice(0, 8);
  const hasPhoto = existsSync(path.join(process.cwd(), 'public/images/about/photo.jpg'));

  // Featured projects lead each shelf; the rest follow in manifest order.
  const shelves: ShelfGroup[] = PROBLEM_SHAPES.map((shape) => ({
    key: shape,
    label: tw(`shape_${shape}`),
    typeLabel: tw(`type_${shape}`),
    projects: lab
      .filter((p) => p.problemShape === shape)
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))),
  }))
    .filter((g) => g.projects.length > 0)
    .sort((a, b) => b.projects.length - a.projects.length);

  return (
    <>
      <Hero stats={stats} collage={government.filter((p) => p.status !== 'private').slice(0, 3)} />

      {/* Government first: it's the work a visitor can't find anywhere else,
          and most of it sits behind a login, so the site is its only window. */}
      {lead && (
        <section className="reveal border-t border-line px-gutter py-section">
          <div className="mx-auto max-w-page">
            <SectionIntro
              kicker={t('flagship.kicker')}
              track="government"
              title={t('flagship.title')}
              subtitle={t('flagship.subtitle')}
              action={
                <ArrowLink href="/work">
                  {t('flagship.view_all', { count: government.length })}
                </ArrowLink>
              }
            />
            <div className="rounded-media border border-line bg-deck p-5 sm:p-8 lg:p-10">
              <FlagshipRow
                project={lead}
                labels={{
                  read: t('flagship.read'),
                  live: tw('live_badge'),
                  staging: tc('staging_badge'),
                  private: tw('private_short'),
                  internal: tc('access_internal'),
                }}
              />
            </div>
            {rest.length > 0 && (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {rest.slice(0, 2).map((p) => (
                  <FlagshipMini key={p.slug} project={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="reveal border-t border-line px-gutter py-section">
        <div className="mx-auto max-w-page">
          <SectionIntro
            kicker={t('lab.kicker', { count: lab.length })}
            track="lab"
            title={t('lab.title')}
            subtitle={t('lab.subtitle')}
            action={<ArrowLink href="/lab">{t('lab.view_all')}</ArrowLink>}
          />
          <LabShelf
            groups={shelves}
            tabsLabel={t('lab.tabs_label')}
            labels={{ live: tw('live_badge'), private: tw('private_short') }}
          />
        </div>
      </section>

      <ProcessSection />

      {stack.length > 0 && (
        <section className="reveal border-t border-line px-gutter py-section-tight">
          <div className="mx-auto max-w-page">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <h2 className="mb-3 font-heading text-h2 font-normal text-cream">{t('stack.title')}</h2>
                <p className="mb-6 text-text-muted">{t('stack.subtitle', { total: stats.total })}</p>
                <ArrowLink href="/about">{t('stack.view_all')}</ArrowLink>
              </div>
              <StackUsageList
                items={stack}
                countLabel={(count) => ta('stack_systems', { count })}
              />
            </div>
          </div>
        </section>
      )}

      <section className="reveal border-t border-line px-gutter py-section">
        <div className="mx-auto flex max-w-page flex-col items-start gap-8 rounded-media border border-line bg-deck p-8 sm:p-12 md:flex-row md:items-center">
          {hasPhoto && (
            <Image
              src="/images/about/photo.jpg"
              alt="Andi Fathul Mukminin"
              width={112}
              height={112}
              className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover md:h-28 md:w-28"
            />
          )}
          <div className="flex-1">
            <h2 className="mb-3 font-heading text-h2 font-normal text-cream">{t('cta.title')}</h2>
            <p className="max-w-xl text-text-muted">{t('cta.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-touch items-center rounded-control bg-gold px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-gold/90"
            >
              {t('cta.contact')}
            </Link>
            <a
              href={CONTACT.cvPdf}
              download
              className="inline-flex min-h-touch items-center gap-2 rounded-control border border-edge px-5 py-3 text-sm font-medium text-cream transition-colors hover:border-edge-strong"
            >
              {t('cta.cv')}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

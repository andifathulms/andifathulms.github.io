import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import PrintButton from '@/components/PrintButton';
import TrackMark from '@/components/TrackMark';
import {
  getPortfolioStats,
  getStackUsage,
  getTrackProjects,
  type ProjectMeta,
} from '@/lib/content';
import { CONTACT, routeMetadata, SITE_URL } from '@/lib/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cv' });
  return routeMetadata({
    locale,
    path: '/cv',
    title: t('title'),
    description: t('meta_description'),
  });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 border-b border-line pb-2 font-mono text-xs uppercase tracking-widest text-text-subtle">
      {children}
    </h2>
  );
}

function ProjectLine({ project }: { project: ProjectMeta }) {
  return (
    <li className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:gap-6">
      <div>
        <Link href={`/work/${project.slug}`} className="font-medium text-cream hover:text-gold">
          {project.title}
        </Link>
        <p className="text-text-muted">{project.tagline}</p>
        <p className="mt-1 text-sm text-text-subtle">{project.techStack.slice(0, 5).join(' · ')}</p>
      </div>
      <p className="font-mono text-xs text-text-subtle sm:text-right">{project.timeframe}</p>
    </li>
  );
}

/**
 * A one-page résumé built from the same manifests as the rest of the site, so
 * it can't fall out of date. It uses only facts the site already states; the
 * print stylesheet in globals.css turns it into a clean black-on-white page.
 */
export default async function CvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'cv' });

  // Work history comes from the PDF résumé (public/CV_…pdf); keep the two in
  // step when either changes. Projects below are read from the manifests.
  const experience = t.raw('experience') as {
    role: string;
    org: string;
    meta: string;
    body: string;
    points: string[];
  }[];
  const stats = getPortfolioStats();
  const government = getTrackProjects('government', locale);
  const lab = getTrackProjects('lab', locale);
  const selectedLab = lab.filter((p) => p.featured).slice(0, 8);
  const stack = getStackUsage().filter((s) => s.count > 1).slice(0, 14);

  // Skills named in the manifests, most frequent first.
  const skillCounts = new Map<string, number>();
  for (const p of [...government, ...lab]) {
    for (const s of p.skills ?? []) skillCounts.set(s, (skillCounts.get(s) ?? 0) + 1);
  }
  const skills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 16)
    .map(([name]) => name);

  const contacts = [
    { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { label: SITE_URL.replace('https://', ''), href: SITE_URL },
    { label: CONTACT.linkedin.replace('https://', ''), href: CONTACT.linkedin },
    { label: CONTACT.github.replace('https://', ''), href: CONTACT.github },
  ];

  return (
    <div className="px-gutter pb-section pt-page-top">
      <article className="mx-auto max-w-doc">
        <header className="mb-12 flex flex-wrap items-start justify-between gap-6 border-b border-line pb-10">
          <div>
            <h1 className="mb-2 font-heading text-h1 font-normal text-cream">{t('name')}</h1>
            <p className="text-lead text-text-muted">
              {t('headline')} · {t('location')}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {contacts.map((c) => (
                <li key={c.href}>
                  <a
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-text-muted hover:text-gold"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="print-hide flex flex-wrap gap-3">
            <a
              href={CONTACT.cvPdf}
              download
              className="inline-flex min-h-touch items-center gap-2 rounded-control bg-gold px-5 py-2 text-sm font-medium text-navy transition-colors hover:bg-gold/90"
            >
              {t('download')}
              <span aria-hidden="true">↓</span>
            </a>
            <PrintButton label={t('print')} />
          </div>
        </header>

        <section className="mb-12">
          <SectionTitle>{t('summary_title')}</SectionTitle>
          <p className="text-lead leading-relaxed text-text-prose">
            {t('summary', { government: stats.government, lab: stats.independent, live: stats.live })}
          </p>
        </section>

        <section className="mb-12">
          <SectionTitle>{t('experience_title')}</SectionTitle>
          <ol className="flex flex-col gap-8">
            {experience.map((job) => (
              <li key={job.org}>
                <p className="font-medium text-cream">
                  {job.role} · {job.org}
                </p>
                <p className="mb-2 font-mono text-xs text-text-subtle">{job.meta}</p>
                {job.body && <p className="mb-2 text-text-prose">{job.body}</p>}
                <ul className="list-disc space-y-1 pl-5 text-text-prose marker:text-text-subtle">
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <SectionTitle>
            <span className="inline-flex items-center gap-2">
              <TrackMark track="government" />
              {t('government_title')} · {government.length}
            </span>
          </SectionTitle>
          <ul className="divide-y divide-line">
            {government.map((p) => (
              <ProjectLine key={p.slug} project={p} />
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <SectionTitle>
            <span className="inline-flex items-center gap-2">
              <TrackMark track="lab" />
              {t('lab_title')}
            </span>
          </SectionTitle>
          <ul className="divide-y divide-line">
            {selectedLab.map((p) => (
              <ProjectLine key={p.slug} project={p} />
            ))}
          </ul>
          {lab.length > selectedLab.length && (
            <Link href="/lab" className="mt-3 inline-flex min-h-touch items-center text-sm text-gold hover:text-cream">
              {t('lab_more', { count: lab.length - selectedLab.length })} →
            </Link>
          )}
        </section>

        <section className="mb-12 grid gap-10 sm:grid-cols-2">
          {skills.length > 0 && (
            <div>
              <SectionTitle>{t('skills_title')}</SectionTitle>
              <ul className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <li key={s} className="rounded bg-deck-2 px-2.5 py-1 text-sm text-cream">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <SectionTitle>{t('stack_title')}</SectionTitle>
            <ul className="columns-2 gap-6 text-sm">
              {stack.map((s) => (
                <li key={s.name} className="flex justify-between gap-3 py-0.5 text-text-muted">
                  <span>{s.name}</span>
                  <span className="font-mono text-text-subtle">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-12 grid gap-10 sm:grid-cols-2">
          <div>
            <SectionTitle>{t('education_title')}</SectionTitle>
            <p className="text-text-prose">{t('education')}</p>
          </div>
          <div>
            <SectionTitle>{t('languages_title')}</SectionTitle>
            <p className="text-text-prose">{t('languages')}</p>
          </div>
        </section>

        <p className="border-t border-line pt-6 text-sm text-text-subtle">
          {t('generated_note')}
        </p>
      </article>
    </div>
  );
}

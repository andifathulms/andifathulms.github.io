import { ViewTransition } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { ProjectMeta } from '@/lib/content';
import { isLive } from '@/lib/project';
import { LockIcon } from './ProjectCard';
import StatusPill from './StatusPill';

export interface FlagshipLabels {
  read: string;
  live: string;
  staging: string;
  private: string;
  internal: string;
}

/**
 * The government track's large format. The screenshot gets half the row and
 * the impact numbers come before the prose, because for internal systems the
 * numbers are the only proof a visitor can't click through to.
 */
export default function FlagshipRow({
  project,
  labels,
  reverse = false,
  headingLevel = 'h3',
  priority = false,
}: {
  project: ProjectMeta;
  labels: FlagshipLabels;
  reverse?: boolean;
  headingLevel?: 'h2' | 'h3';
  priority?: boolean;
}) {
  const Heading = headingLevel;
  const metrics = (project.metrics ?? []).slice(0, 3);
  const href = `/work/${project.slug}`;

  const status = isLive(project)
    ? project.access === 'internal'
      ? { text: labels.internal, lock: true }
      : { text: labels.live, pill: true }
    : project.liveIsStaging
      ? { text: labels.staging }
      : project.status === 'private'
        ? { text: labels.private, lock: true }
        : null;

  return (
    // The screenshot always gets the wider column. Reversing only the order
    // left it in the narrow one on alternate rows.
    <article
      className={`grid items-center gap-8 lg:gap-14 ${
        reverse ? 'lg:grid-cols-[1fr_1.2fr]' : 'lg:grid-cols-[1.2fr_1fr]'
      }`}
    >
      <ViewTransition name={`shot-${project.slug}`} share="morph" default="none">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className={`group relative block aspect-[16/10] overflow-hidden rounded-media border border-line-strong bg-deck ${
            reverse ? 'lg:order-2' : ''
          }`}
        >
          {project.heroImage && (
            <Image
              src={project.heroImage}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 620px"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )}
        </Link>
      </ViewTransition>

      <div>
        <p className="mb-3 font-mono text-meta text-text-subtle">
          {[project.timeframe, project.role].filter(Boolean).join(' · ')}
        </p>
        <Heading className="mb-3 flex items-center gap-3 font-heading text-h2 font-normal text-cream">
          {project.icon && (
            <Image
              src={project.icon}
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
              className="h-10 w-10 flex-shrink-0 rounded-lg border border-line object-cover"
            />
          )}
          <Link href={href} className="transition-colors hover:text-gold">
            {project.title}
          </Link>
        </Heading>
        <p className="max-w-xl text-lead text-text-muted">{project.tagline}</p>

        {metrics.length > 0 && (
          <dl className="my-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 sm:grid-cols-3">
            {metrics.map((m) => (
              // Reversed so the dt is announced first; justify-end then packs
              // the pair to the top, so values line up when labels wrap.
              <div key={m.label} className="flex flex-col-reverse justify-end">
                <dt className="text-sm leading-snug text-text-muted">{m.label}</dt>
                <dd className="mb-1 font-heading text-[1.75rem] leading-none text-cream [overflow-wrap:anywhere]">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href={href}
            className="group inline-flex min-h-touch items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-cream"
          >
            {labels.read}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          {status &&
            (status.pill ? (
              <StatusPill label={status.text} />
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-text-subtle">
                {status.lock && <LockIcon />}
                {status.text}
              </span>
            ))}
        </div>
      </div>
    </article>
  );
}

/** The compact sibling, for the two rows under the lead flagship on the home page. */
export function FlagshipMini({ project }: { project: ProjectMeta }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex items-center gap-4 rounded-media border border-line bg-deck p-3.5 transition-colors hover:border-line-strong"
    >
      <span className="relative block aspect-[16/10] w-28 flex-shrink-0 overflow-hidden rounded-md border border-line">
        {project.heroImage && (
          <Image
            src={project.heroImage}
            alt=""
            fill
            sizes="112px"
            className="object-cover object-top"
          />
        )}
      </span>
      <span className="min-w-0">
        <span className="block font-heading text-[1.25rem] leading-tight text-cream transition-colors group-hover:text-gold">
          {project.title}
        </span>
        <span className="mt-1 line-clamp-2 block text-sm text-text-muted">{project.tagline}</span>
      </span>
    </Link>
  );
}

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { ProjectMeta } from '@/lib/content';
import { isLive, trackOf, yearOf } from '@/lib/project';
import CardPreview from './CardPreview';
import StatusPill from './StatusPill';
import TrackMark from './TrackMark';

const CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px';

export interface ProjectCardLabels {
  /** "Explainer", "Data atlas"… — the project's problem shape, singular. */
  type: string;
  live: string;
  private: string;
}

/**
 * One label line instead of three rows of chips: track marker + type on the
 * left, year on the right. The full tag and stack lists live on the case
 * study, where there's room for them.
 */
export default function ProjectCard({
  project,
  labels,
}: {
  project: ProjectMeta;
  labels: ProjectCardLabels;
}) {
  const year = yearOf(project);
  const isPrivate = project.status === 'private';

  return (
    <Link href={`/work/${project.slug}`} className="group flex h-full flex-col">
      <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-media border border-line bg-deck transition-colors group-hover:border-line-strong">
        <CardPreview
          hero={project.heroImage}
          images={project.previewImages ?? []}
          alt={project.title}
          sizes={CARD_SIZES}
        />
        {isLive(project) && (
          <StatusPill label={labels.live} className="absolute right-2.5 top-2.5 z-10" />
        )}
      </div>

      <div className="mb-2 flex items-center gap-2 text-sm text-text-muted">
        <TrackMark track={trackOf(project)} />
        <span>{labels.type}</span>
        {isPrivate && (
          <span className="inline-flex items-center gap-1 text-text-subtle">
            <span aria-hidden="true">·</span>
            <LockIcon />
            {labels.private}
          </span>
        )}
        {year && <span className="ml-auto font-mono text-xs text-text-subtle">{year}</span>}
      </div>

      <h3 className="mb-2 flex items-center gap-2.5 font-heading text-h3 font-normal text-cream transition-colors group-hover:text-gold">
        {project.icon && (
          <Image
            src={project.icon}
            alt=""
            aria-hidden="true"
            width={28}
            height={28}
            className="h-7 w-7 flex-shrink-0 rounded-md border border-line object-cover"
          />
        )}
        <span>
          {project.title}
          <span
            aria-hidden="true"
            className="ml-1.5 inline-block -translate-x-1 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none"
          >
            →
          </span>
        </span>
      </h3>

      <p className="mb-4 line-clamp-2 text-[0.9375rem] leading-relaxed text-text-muted">
        {project.tagline}
      </p>

      <p className="mt-auto text-sm text-text-subtle">{project.techStack.slice(0, 3).join(' · ')}</p>
    </Link>
  );
}

export function LockIcon({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <rect x="2.5" y="6" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

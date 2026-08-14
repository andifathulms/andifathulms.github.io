import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { ProjectMeta } from '@/lib/content';
import TechStackChips from './TechStackChips';
import CardPreview from './CardPreview';

const CARD_SIZES = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';

interface ProjectCardProps {
  project: ProjectMeta;
  privateBadgeLabel: string;
  liveBadgeLabel?: string;
}

export default function ProjectCard({
  project,
  privateBadgeLabel,
  liveBadgeLabel = 'Live',
}: ProjectCardProps) {
  const isPrivate = project.status === 'private';

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex h-full flex-col border-t border-line pt-6 pb-6 hover:border-edge-accent transition-all duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Hero image + hover screenshot preview */}
      <div className="aspect-video bg-navy/50 border border-edge rounded overflow-hidden mb-5 relative">
        <CardPreview
          hero={project.heroImage}
          images={project.previewImages ?? []}
          alt={project.title}
          sizes={CARD_SIZES}
        />

        {/* Live indicator — signals a reachable deployed site (matches the Live
            filter: production only, not staging). */}
        {project.liveUrl && !project.liveIsStaging && (
          // Opaque, not translucent — a blurred glass badge is the exact
          // generic-SaaS pattern DESIGN.md names as an anti-reference.
          <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 rounded-full border border-line bg-navy px-2.5 py-1 font-mono text-meta text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {liveBadgeLabel}
          </span>
        )}
      </div>

      {/* Category tags. Reserved height for two chip rows so a card that wraps
          (Aksara: four tags) doesn't push its title and tagline out of line
          with its neighbours — titles align across a row either way. Cards
          only sit side by side from md up, so mobile keeps its natural height. */}
      <div className="flex flex-wrap gap-1.5 mb-3 md:min-h-tagrow md:content-start">
        {project.categoryTags.map((tag) => (
          <span key={tag} className="font-mono text-meta text-accent-2 px-2 py-0.5 border border-line-muted rounded">
            {tag}
          </span>
        ))}
        {isPrivate && (
          <span className="font-mono text-meta text-text-subtle px-2 py-0.5 border border-edge rounded">
            {privateBadgeLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 mb-1.5">
        {project.icon && (
          <Image
            src={project.icon}
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            className="h-8 w-8 flex-shrink-0 rounded-lg border border-edge object-cover"
          />
        )}
        <h3 className="font-heading text-h3 font-medium text-cream group-hover:text-gold transition-colors">
          {project.title}
          <span
            aria-hidden="true"
            className="ml-1.5 inline-block text-gold opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 motion-reduce:transition-none motion-reduce:translate-x-0"
          >
            →
          </span>
        </h3>
      </div>
      <p className="text-body text-text-muted mb-4 leading-relaxed">{project.tagline}</p>

      <div className="mt-auto pt-4">
        <TechStackChips stack={project.techStack} maxVisible={4} />
      </div>
    </Link>
  );
}

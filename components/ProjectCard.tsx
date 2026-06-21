import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { ProjectMeta } from '@/lib/content';
import TechStackChips from './TechStackChips';

interface ProjectCardProps {
  project: ProjectMeta;
  privateBadgeLabel: string;
}

export default function ProjectCard({ project, privateBadgeLabel }: ProjectCardProps) {
  const isPrivate = project.status === 'private';

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block border-t border-gold/20 pt-6 pb-6 hover:border-gold/40 transition-colors"
    >
      {/* Hero image */}
      <div className="aspect-video bg-navy/50 border border-cream/5 rounded overflow-hidden mb-5 relative">
        {project.heroImage ? (
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs text-cream/20">no image</span>
          </div>
        )}
      </div>

      {/* Category tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {project.categoryTags.map((tag) => (
          <span key={tag} className="font-mono text-xs text-clay/70 px-2 py-0.5 border border-clay/20 rounded">
            {tag}
          </span>
        ))}
        {isPrivate && (
          <span className="font-mono text-xs text-cream/40 px-2 py-0.5 border border-cream/10 rounded">
            {privateBadgeLabel}
          </span>
        )}
      </div>

      <h3 className="font-heading text-xl font-medium text-cream mb-1.5 group-hover:text-gold transition-colors">
        {project.title}
      </h3>
      <p className="text-sm text-cream/60 mb-4 leading-relaxed">{project.tagline}</p>

      <TechStackChips stack={project.techStack} maxVisible={4} />
    </Link>
  );
}

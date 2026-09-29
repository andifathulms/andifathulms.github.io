import { Link } from '@/i18n/navigation';
import type { StackUsage } from '@/lib/content';
import StackIcon from './StackIcon';

/**
 * Technologies counted from the manifests, each row linking to a search
 * across both tracks. A logo says "I have heard of Keycloak"; a count says
 * how many shipped projects depend on it, and it can't drift from them.
 */
export default function StackUsageList({
  items,
  countLabel,
}: {
  items: StackUsage[];
  countLabel: (count: number) => string;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
      {items.map((tech) => (
        <Link
          key={tech.name}
          href={`/lab?filter=all&q=${encodeURIComponent(tech.name)}`}
          className="group flex min-h-touch items-center gap-3 border-b border-line py-2.5 transition-colors hover:border-line-strong"
        >
          <StackIcon
            name={tech.name}
            className="h-5 w-5 flex-shrink-0 text-text-subtle transition-colors group-hover:text-gold"
          />
          <span className="text-body text-text-muted transition-colors group-hover:text-cream">
            {tech.name}
          </span>
          <span className="ml-auto font-mono text-meta text-text-subtle">{countLabel(tech.count)}</span>
        </Link>
      ))}
    </div>
  );
}

import { Link } from '@/i18n/navigation';

interface TechStackChipsProps {
  stack: string[];
  maxVisible?: number;
  size?: 'sm' | 'md';
  /**
   * Link each chip to the work index filtered by that technology, the way the
   * About page's stack counts already do.
   *
   * Opt-in rather than default because ProjectCard renders this inside a
   * <Link>, and an anchor nested in an anchor is invalid HTML — the browser
   * closes the outer one early and the card stops being clickable. Only pass
   * this where the chips are not already inside a link.
   */
  linked?: boolean;
}

export default function TechStackChips({
  stack,
  maxVisible = 5,
  size = 'sm',
  linked = false,
}: TechStackChipsProps) {
  const visible = stack.slice(0, maxVisible);
  const overflow = stack.length - maxVisible;

  // Gold is reserved for the one thing that's actively primary on a screen
  // (DESIGN.md's One Voice Rule) — a tech-stack chip is metadata, not a call
  // to action, so it rests at the muted tone and only brightens on hover.
  const chipClass =
    size === 'sm'
      ? 'font-mono text-meta px-2 py-0.5 border border-line text-text-muted rounded'
      : 'font-mono text-sm px-2.5 py-1 border border-line text-text-muted rounded';

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((tech) =>
        linked ? (
          <Link
            key={tech}
            href={`/work?q=${encodeURIComponent(tech)}`}
            className={`${chipClass} min-h-touch inline-flex items-center transition-colors hover:border-edge-accent hover:text-cream`}
          >
            {tech}
          </Link>
        ) : (
          <span key={tech} className={chipClass}>
            {tech}
          </span>
        )
      )}
      {/* The overflow count is never a link — it isn't a technology. */}
      {overflow > 0 && (
        <span className={`${chipClass} text-text-subtle`}>+{overflow}</span>
      )}
    </div>
  );
}

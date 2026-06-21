interface TechStackChipsProps {
  stack: string[];
  maxVisible?: number;
  size?: 'sm' | 'md';
}

export default function TechStackChips({
  stack,
  maxVisible = 5,
  size = 'sm',
}: TechStackChipsProps) {
  const visible = stack.slice(0, maxVisible);
  const overflow = stack.length - maxVisible;

  const chipClass =
    size === 'sm'
      ? 'font-mono text-xs px-2 py-0.5 border border-gold/30 text-gold/80 rounded'
      : 'font-mono text-sm px-2.5 py-1 border border-gold/30 text-gold/80 rounded';

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((tech) => (
        <span key={tech} className={chipClass}>
          {tech}
        </span>
      ))}
      {overflow > 0 && (
        <span className={`${chipClass} text-cream/40`}>+{overflow}</span>
      )}
    </div>
  );
}

/**
 * Shared section header. `tone` is the only lever for hierarchy — `primary`
 * for the sections that carry the page's argument (the work, the closing
 * ask), `secondary` for supporting ones. Previously every section on the home
 * page used an identical heading size and band, so nothing read as more
 * important than anything else and there was no scan path.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = 'secondary',
  align = 'left',
  className = '',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: 'primary' | 'secondary';
  align?: 'left' | 'center';
  className?: string;
}) {
  const primary = tone === 'primary';

  return (
    <div className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
      {eyebrow && (
        <p className="font-mono text-meta uppercase tracking-widest text-accent mb-3">{eyebrow}</p>
      )}
      <h2
        className={`font-heading font-medium text-cream ${
          primary ? 'text-h2 mb-4' : 'text-h3 mb-2.5'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-text-muted ${primary ? 'text-lead max-w-xl' : 'max-w-lg'} ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

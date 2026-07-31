interface MetricsStripProps {
  metrics: { value: string; label: string }[];
  label: string;
}

/**
 * Scannable outcomes strip for a case study — renders only when the project's
 * meta.json declares real `metrics`. Kept factual: no invented numbers.
 */
export default function MetricsStrip({ metrics, label }: MetricsStripProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <section className="border-b border-gold/20 pb-8 mb-10" aria-label={label}>
      <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-5">
        {label}
      </p>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        {metrics.map((m) => (
          <div key={m.label}>
            <dt className="sr-only">{m.label}</dt>
            <dd className="font-heading text-3xl md:text-4xl font-medium text-cream leading-none mb-2">
              {m.value}
            </dd>
            <p className="text-xs text-cream/50 leading-snug">{m.label}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

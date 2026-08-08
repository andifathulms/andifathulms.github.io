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
    <section className="border-b border-line pb-8 mb-10" aria-label={label}>
      <p className="font-mono text-meta text-accent uppercase tracking-wider mb-5">
        {label}
      </p>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        {metrics.map((m) => (
          // dt first so the term is announced before its value, and only once:
          // the label used to be rendered twice (an sr-only dt plus a visible
          // p), so assistive tech read every figure's label two times. The `p`
          // was also an invalid direct child of the dl wrapper.
          <div key={m.label} className="flex flex-col-reverse">
            <dt className="text-meta text-text-subtle leading-snug">{m.label}</dt>
            <dd className="font-heading text-h2 font-medium text-cream leading-none mb-2 break-words hyphens-none [overflow-wrap:anywhere]">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

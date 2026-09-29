interface MetricsStripProps {
  metrics: { value: string; label: string }[];
  label: string;
}

/**
 * Outcomes, right under the hero. Impact metrics only (VOICE.md rule 5), so
 * they read without the write-up's vocabulary and belong before it.
 */
export default function MetricsStrip({ metrics, label }: MetricsStripProps) {
  if (!metrics || metrics.length === 0) return null;

  const cols = metrics.length >= 4 ? 'lg:grid-cols-4' : metrics.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

  return (
    <section aria-label={label}>
      <dl className={`grid grid-cols-2 gap-px overflow-hidden rounded-media border border-line bg-line ${cols}`}>
        {metrics.map((m) => (
          // dt first so the term is announced before its value; reversed
          // visually and packed to the top so values align when labels wrap.
          <div key={m.label} className="flex flex-col-reverse justify-end bg-navy px-5 py-5">
            <dt className="text-sm leading-snug text-text-muted">{m.label}</dt>
            <dd className="mb-2 font-heading text-stat leading-none text-cream [overflow-wrap:anywhere]">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

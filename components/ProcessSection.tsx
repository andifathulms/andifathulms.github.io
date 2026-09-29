import { useTranslations } from 'next-intl';
import SectionHeading from './SectionHeading';

export default function ProcessSection() {
  const t = useTranslations('home.process');

  const steps = [
    {
      label: t('steps.0.label'),
      title: t('steps.0.title'),
      description: t('steps.0.description'),
    },
    {
      label: t('steps.1.label'),
      title: t('steps.1.title'),
      description: t('steps.1.description'),
    },
    {
      label: t('steps.2.label'),
      title: t('steps.2.title'),
      description: t('steps.2.description'),
    },
  ];

  return (
    <section className="reveal border-t border-line py-section-tight px-gutter">
      <div className="max-w-page mx-auto">
        <SectionHeading tone="primary" title={t('title')} subtitle={t('subtitle')} className="mb-stack" />

        {/* Numbered because it is a real sequence: spec, then plan, then build. */}
        <ol className="mb-10 grid grid-cols-1 gap-px overflow-hidden rounded-media border border-line bg-line md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.label} className="bg-navy p-6 sm:p-7">
              <p className="mb-4 font-mono text-meta text-gold">{step.label}</p>
              <h3 className="mb-3 font-sans text-lead font-semibold text-cream">{step.title}</h3>
              <p className="text-body leading-relaxed text-text-muted">{step.description}</p>
            </li>
          ))}
        </ol>

        <p className="max-w-3xl border-l-2 border-edge-accent pl-5 text-lead text-text-prose">
          {t('note')}
        </p>
      </div>
    </section>
  );
}

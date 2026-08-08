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
      <div className="max-w-5xl mx-auto">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} className="mb-stack" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {steps.map((step) => (
            <div key={step.label}>
              <p className="font-mono text-meta text-accent mb-3">{step.label}</p>
              <h3 className="font-heading text-lead font-medium text-cream mb-3">{step.title}</h3>
              <p className="text-body text-text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="font-mono text-meta text-text-subtle border-t border-line pt-6">
          {t('note')}
        </p>
      </div>
    </section>
  );
}

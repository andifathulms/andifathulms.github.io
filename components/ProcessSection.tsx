import { useTranslations } from 'next-intl';

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
    <section className="border-t border-gold/20 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-cream mb-3">
            {t('title')}
          </h2>
          <p className="text-cream/60 max-w-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {steps.map((step) => (
            <div key={step.label}>
              <p className="font-mono text-xs text-gold/60 mb-3">{step.label}</p>
              <h3 className="font-heading text-lg font-medium text-cream mb-3">{step.title}</h3>
              <p className="text-sm text-cream/60 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="font-mono text-xs text-cream/30 border-t border-gold/10 pt-6">
          {t('note')}
        </p>
      </div>
    </section>
  );
}

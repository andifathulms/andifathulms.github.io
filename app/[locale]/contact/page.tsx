import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-lg">
          <h1 className="font-heading text-4xl md:text-5xl font-medium text-cream mb-4">
            {t('title')}
          </h1>
          <p className="font-heading text-xl text-gold mb-8">{t('subtitle')}</p>
          <p className="text-cream/70 leading-relaxed mb-12">{t('body')}</p>

          <div className="flex flex-col gap-4 mb-12">
            <div className="border-t border-gold/20 pt-5">
              <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-2">
                {t('email_label')}
              </p>
              <a
                href="mailto:officialandifathul@gmail.com"
                className="text-cream hover:text-gold transition-colors"
              >
                officialandifathul@gmail.com
              </a>
            </div>

            <div className="border-t border-gold/20 pt-5">
              <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-2">
                {t('whatsapp_label')}
              </p>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream hover:text-gold transition-colors"
              >
                WhatsApp ↗
              </a>
            </div>
          </div>

          <p className="font-mono text-xs text-cream/30 border-t border-gold/10 pt-6">
            {t('note')}
          </p>
        </div>
      </div>
    </div>
  );
}

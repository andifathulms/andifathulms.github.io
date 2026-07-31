import { existsSync } from 'fs';
import path from 'path';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import CopyButton from '@/components/CopyButton';
import { CONTACT } from '@/lib/site';

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

  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t('email_subject'))}`;
  const whatsapp = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(t('whatsapp_message'))}`;
  const hasResume = existsSync(path.join(process.cwd(), 'public', CONTACT.resumePath.replace(/^\//, '')));

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
            {/* Email */}
            <div className="border-t border-gold/20 pt-5">
              <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-2">
                {t('email_label')}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href={mailto}
                  className="text-cream hover:text-gold transition-colors"
                >
                  {CONTACT.email}
                </a>
                <CopyButton
                  value={CONTACT.email}
                  copyLabel={t('copy')}
                  copiedLabel={t('copied')}
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="border-t border-gold/20 pt-5">
              <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-2">
                {t('whatsapp_label')}
              </p>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream hover:text-gold transition-colors"
              >
                {t('whatsapp_cta')}
              </a>
            </div>

            {/* LinkedIn */}
            <div className="border-t border-gold/20 pt-5">
              <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-2">
                {t('linkedin_label')}
              </p>
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream hover:text-gold transition-colors"
              >
                {t('linkedin_cta')}
              </a>
            </div>

            {/* Résumé — only rendered when the PDF is present */}
            {hasResume && (
              <div className="border-t border-gold/20 pt-5">
                <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-2">
                  {t('resume_label')}
                </p>
                <a
                  href={CONTACT.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream hover:text-gold transition-colors"
                >
                  {t('resume_download')} ↓
                </a>
              </div>
            )}
          </div>

          <p className="font-mono text-xs text-cream/30 border-t border-gold/10 pt-6">
            {t('note')}
          </p>
        </div>
      </div>
    </div>
  );
}

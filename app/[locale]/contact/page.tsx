import { existsSync } from 'fs';
import path from 'path';
import * as si from 'simple-icons';
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

// LinkedIn is no longer distributed by simple-icons (trademark request).
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z';

function ChannelIcon({ name }: { name: string }) {
  const cls = 'w-[18px] h-[18px]';
  if (name === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
        <path d={si.siWhatsapp.path} />
      </svg>
    );
  }
  if (name === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
        <path d={LINKEDIN_PATH} />
      </svg>
    );
  }
  if (name === 'resume') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cls}>
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  // email
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cls}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
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
    <div className="pt-page-top pb-section px-gutter">
      <div className="max-w-page mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: intro */}
          <div>
            <h1 className="font-heading text-h1 font-medium text-cream mb-4">
              {t('title')}
            </h1>
            <p className="font-heading text-h3 text-gold mb-6">{t('subtitle')}</p>

            {/* Availability status */}
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-gold/[0.04] px-3.5 py-1.5 mb-8">
              {/* Flat dot. The pulsing halo it replaces was the last
                  glow-adjacent effect on the site, against PRD §4's "no
                  gradients, drop shadows, or glow/neon — flat surfaces". */}
              <span className="inline-flex h-2 w-2 rounded-full bg-gold" />
              <span className="font-mono text-meta text-text-muted">{t('availability')}</span>
            </div>

            <p className="text-text-muted leading-relaxed mb-8">{t('body')}</p>

            <p className="font-mono text-meta text-text-subtle border-t border-line pt-6 max-w-md">
              {t('note')}
            </p>
          </div>

          {/* Right: channels */}
          <div>
            <p className="font-mono text-meta text-accent uppercase tracking-wider mb-6">
              {t('channels_label')}
            </p>
            <div className="flex flex-col">
              {/* Email */}
              <div className="flex items-start gap-4 border-t border-line pt-5 pb-5">
                <span className="mt-0.5 text-accent">
                  <ChannelIcon name="email" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-meta text-accent uppercase tracking-wider mb-1.5">
                    {t('email_label')}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a href={mailto} className="text-cream hover:text-gold transition-colors break-all">
                      {CONTACT.email}
                    </a>
                    <CopyButton value={CONTACT.email} copyLabel={t('copy')} copiedLabel={t('copied')} />
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 border-t border-line pt-5 pb-5"
              >
                <span className="mt-0.5 text-accent transition-colors group-hover:text-gold">
                  <ChannelIcon name="whatsapp" />
                </span>
                <div>
                  <p className="font-mono text-meta text-accent uppercase tracking-wider mb-1.5">
                    {t('whatsapp_label')}
                  </p>
                  <span className="text-cream transition-colors group-hover:text-gold">
                    {t('whatsapp_cta')}
                  </span>
                </div>
              </a>

              {/* LinkedIn */}
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 border-t border-line pt-5 pb-5"
              >
                <span className="mt-0.5 text-accent transition-colors group-hover:text-gold">
                  <ChannelIcon name="linkedin" />
                </span>
                <div>
                  <p className="font-mono text-meta text-accent uppercase tracking-wider mb-1.5">
                    {t('linkedin_label')}
                  </p>
                  <span className="text-cream transition-colors group-hover:text-gold">
                    {t('linkedin_cta')}
                  </span>
                </div>
              </a>

              {/* Résumé — only when the PDF exists */}
              {hasResume && (
                <a
                  href={CONTACT.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 border-t border-line pt-5 pb-5"
                >
                  <span className="mt-0.5 text-accent transition-colors group-hover:text-gold">
                    <ChannelIcon name="resume" />
                  </span>
                  <div>
                    <p className="font-mono text-meta text-accent uppercase tracking-wider mb-1.5">
                      {t('resume_label')}
                    </p>
                    <span className="text-cream transition-colors group-hover:text-gold">
                      {t('resume_download')} ↓
                    </span>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

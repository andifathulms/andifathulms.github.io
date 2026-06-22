import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import StackIcon from '@/components/StackIcon';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('title'),
    description: t('intro'),
  };
}

const stack = [
  'Next.js', 'TypeScript', 'React', 'PostgreSQL', 'Tailwind CSS',
  'Node.js', 'Python', 'Docker', 'Railway', 'Vercel',
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl">
          <p className="font-mono text-sm text-gold/70 mb-4">{t('intro')}</p>
          <h1 className="font-heading text-4xl md:text-5xl font-medium text-cream mb-12">
            {t('title')}
          </h1>

          <div className="space-y-6 text-cream/75 leading-relaxed">
            <p>{t('bio_1')}</p>
            <p>{t('bio_2')}</p>
            <p>{t('bio_3')}</p>
            <p>{t('bio_4')}</p>
          </div>

          <div className="border-t border-gold/20 mt-14 pt-10">
            <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-5">
              {t('stack_title')}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-4 gap-y-6">
              {stack.map((tech) => (
                <div key={tech} className="flex flex-col items-center gap-2">
                  <StackIcon name={tech} className="w-6 h-6 text-cream/50" />
                  <span className="font-mono text-xs text-cream/40 text-center leading-tight">
                    {tech}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gold/20 mt-14 pt-10">
            <h2 className="font-heading text-2xl font-medium text-cream mb-3">
              {t('cta_title')}
            </h2>
            <p className="text-cream/60 mb-6">{t('cta_body')}</p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-gold text-navy text-sm font-medium rounded hover:bg-gold/90 transition-colors"
            >
              {t('cta_button')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

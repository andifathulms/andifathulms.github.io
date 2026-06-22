import { existsSync } from 'fs';
import path from 'path';
import Image from 'next/image';
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

  const hasPhoto = existsSync(path.join(process.cwd(), 'public/images/about/photo.jpg'));

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* 1. Photo + name + role strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          {hasPhoto ? (
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto md:mx-0 rounded-2xl overflow-hidden flex-shrink-0">
              <Image
                src="/images/about/photo.jpg"
                alt="Andi Fathul Mukminin"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 256px, 320px"
              />
            </div>
          ) : (
            <div className="w-64 h-64 md:w-80 md:h-80 mx-auto md:mx-0 rounded-2xl bg-navy border border-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-6xl text-gold/60 select-none">AF</span>
            </div>
          )}

          <div>
            <p className="font-mono text-xs text-gold uppercase tracking-widest mb-4">
              {t('intro')}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-medium text-cream mb-8">
              {t('title')}
            </h1>
            <div className="space-y-3">
              {[
                { label: t('role_label'), value: t('role_value') },
                { label: t('directorate_label'), value: t('directorate_value') },
                { label: t('location_label'), value: t('location_value') },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 items-baseline">
                  <span className="font-mono text-xs text-gold/50 uppercase tracking-wider w-28 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-cream/75 text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl">
          {/* 2. Bio paragraphs */}
          <div className="space-y-6 text-cream/75 leading-relaxed">
            <p>{t('bio_1')}</p>
            <p>{t('bio_2')}</p>
            <p>{t('bio_3')}</p>
            <p>{t('bio_4')}</p>
          </div>

          {/* 3. Availability */}
          <div className="border-t border-gold/20 mt-14 pt-10">
            <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-3">
              {t('availability_label')}
            </p>
            <p className="text-cream/70 leading-relaxed">{t('availability')}</p>
          </div>

          {/* 4. Tech stack */}
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

          {/* 5. CTA */}
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

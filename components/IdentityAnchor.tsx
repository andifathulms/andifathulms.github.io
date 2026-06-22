import { existsSync } from 'fs';
import path from 'path';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function PhotoOrFallback({ hasPhoto }: { hasPhoto: boolean }) {
  if (hasPhoto) {
    return (
      <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto md:mx-0 rounded-2xl overflow-hidden flex-shrink-0">
        <Image
          src="/images/about/photo.jpg"
          alt="Andi Fathul Mukminin"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 256px, 288px"
        />
      </div>
    );
  }

  return (
    <div className="w-64 h-64 md:w-72 md:h-72 mx-auto md:mx-0 rounded-2xl bg-navy border border-gold/20 flex items-center justify-center flex-shrink-0">
      <span className="font-heading text-5xl text-gold/60 select-none">AF</span>
    </div>
  );
}

export default function IdentityAnchor() {
  const t = useTranslations('home.identity_anchor');
  const hasPhoto = existsSync(path.join(process.cwd(), 'public/images/about/photo.jpg'));
  const chips = t.raw('chips') as string[];

  return (
    <section className="border-t border-gold/20 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <PhotoOrFallback hasPhoto={hasPhoto} />

          <div>
            <p className="font-mono text-xs text-gold uppercase tracking-widest mb-4">
              {t('label')}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-cream mb-5">
              {t('name')}
            </h2>
            <p className="text-cream/70 leading-relaxed mb-6 text-lg">
              {t('bio')}
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="font-mono text-xs text-cream/50 border border-cream/20 rounded px-3 py-1"
                >
                  {chip}
                </span>
              ))}
            </div>
            <Link
              href="/about"
              className="text-sm text-gold hover:text-gold/80 transition-colors"
            >
              {t('read_more')} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

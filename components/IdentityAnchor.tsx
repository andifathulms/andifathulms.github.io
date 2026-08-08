import { existsSync } from 'fs';
import path from 'path';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import SocialLinks from './SocialLinks';

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
    <div className="w-64 h-64 md:w-72 md:h-72 mx-auto md:mx-0 rounded-2xl bg-navy border border-line flex items-center justify-center flex-shrink-0">
      <span className="font-heading text-display text-accent select-none">AF</span>
    </div>
  );
}

export default function IdentityAnchor() {
  const t = useTranslations('home.identity_anchor');
  const hasPhoto = existsSync(path.join(process.cwd(), 'public/images/about/photo.jpg'));
  const chips = t.raw('chips') as string[];

  return (
    <section className="reveal border-t border-line py-section-tight px-gutter">
      <div className="max-w-page mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <PhotoOrFallback hasPhoto={hasPhoto} />

          <div>
            <p className="font-mono text-meta text-gold uppercase tracking-widest mb-4">
              {t('label')}
            </p>
            <h2 className="font-heading text-h3 font-medium text-cream mb-4">
              {t('name')}
            </h2>
            <p className="text-text-muted leading-relaxed mb-6 text-lead">
              {t('bio')}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="font-mono text-meta text-text-subtle border border-edge rounded px-3 py-1"
                >
                  {chip}
                </span>
              ))}
            </div>
            <SocialLinks className="mb-8" />
            <Link
              href="/about"
              className="text-sm text-accent hover:text-cream transition-colors"
            >
              {t('read_more')} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

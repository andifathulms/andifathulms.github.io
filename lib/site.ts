// Canonical site URL — user GitHub Pages site (no basePath).
export const SITE_URL = 'https://andifathulms.github.io';

export const SITE_NAME = 'AFM Studio';

// Contact channels — single source of truth for the contact page + footer.
export const CONTACT = {
  email: 'officialandifathul@gmail.com',
  whatsapp: '6281355056456', // international format, no leading 0 / no +
  linkedin: 'https://linkedin.com/in/andifathulmukminin',
  // Résumé lives at public/andi-fathul-mukminin-cv.pdf when present.
  resumePath: '/andi-fathul-mukminin-cv.pdf',
};

// Social / professional channels — surfaced on About, home, and footer.
export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/andifathulmukminin', icon: 'linkedin' },
  { label: 'GitHub', href: 'https://github.com/andifathulms', icon: 'github' },
  { label: 'TikTok', href: 'https://tiktok.com/@nusantaramapper', icon: 'tiktok' },
  { label: 'Email', href: `mailto:${CONTACT.email}`, icon: 'email' },
] as const;

// Person behind the studio — used for JSON-LD structured data.
export const PERSON = {
  name: 'Andi Fathul Mukminin',
  jobTitle: 'Fullstack Software Engineer',
  worksFor: 'Otorita IKN (Nusantara Capital Authority)',
  email: 'officialandifathul@gmail.com',
  sameAs: [
    'https://github.com/andifathulms',
    'https://linkedin.com/in/andifathulmukminin',
    'https://tiktok.com/@nusantaramapper',
  ],
};

/**
 * Per-route metadata. Every page must call this: a page that inherits the
 * layout's `alternates` silently claims the *home page* as its canonical, and
 * a page that omits `openGraph` shares the home page's share card. Both were
 * happening on /work, /about and /contact in both locales.
 *
 * `path` is the locale-relative route ('' for home, '/work', '/work/aksara').
 * Title and description must be the same strings the page renders — passing
 * hand-written copy here is how metadata drifts from the page.
 */
export function routeMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = 'website',
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
}) {
  const url = (l: string) => `${SITE_URL}/${l}${path}`.replace(/\/?$/, '/');
  const ogImage = image ?? '/og.png';

  return {
    title,
    description,
    alternates: {
      canonical: url(locale),
      languages: {
        en: url('en'),
        id: url('id'),
        'x-default': url('en'),
      },
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: `${title} — ${SITE_NAME}`,
      description,
      url: url(locale),
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  };
}

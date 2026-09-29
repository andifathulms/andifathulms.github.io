import type { Metadata } from 'next';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SITE_URL, SITE_NAME, PERSON } from '@/lib/site';
import { getAllProjects, trackOf } from '@/lib/content';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import '../globals.css';

// Fraunces is loaded as a variable font so the optical-size and SOFT axes are
// available: at display sizes, opsz 144 + SOFT is what makes it read as
// editorial rather than as a heavy default serif.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'opsz'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const description =
    locale === 'id'
      ? 'Portofolio Andi Fathul Mukminin, fullstack developer yang membangun sistem pemerintahan untuk ibu kota baru Indonesia di Otorita IKN.'
      : "Portfolio of Andi Fathul Mukminin, a fullstack developer building government systems for Indonesia's new capital at Otorita IKN.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s — ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: 'Andi Fathul Mukminin' }],
    creator: 'Andi Fathul Mukminin',
    // No alternates or openGraph here on purpose. Metadata objects merge by
    // field, so anything set at the layout level is inherited verbatim by every
    // child that doesn't override it — which is how /work, /about and /contact
    // all came to declare the home page as their canonical. Each page calls
    // routeMetadata() instead.
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  // Only the namespaces client components actually read. The provider
  // serialises whatever it's given into every page's HTML, so passing the
  // whole catalogue shipped the home, about and contact copy — plus every
  // case study string — to the browser on routes that never render them.
  // Server components don't read from here; they call getTranslations().
  //
  // If a *client* component starts using a new namespace, add it here or it
  // will throw MISSING_MESSAGE at runtime. Current readers:
  //   nav, a11y   Header, LocaleSwitcher      (every page)
  //   work        WorkGallery, CardPreview    (home + work index)
  //   case_study  ScreenshotGallery           (case studies)
  //   palette     CommandPalette              (every page)
  const CLIENT_NAMESPACES = ['nav', 'a11y', 'work', 'case_study', 'palette'] as const;
  const allMessages = await getMessages();
  const messages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((ns) => ns in allMessages).map((ns) => [ns, allMessages[ns]])
  );
  const t = await getTranslations({ locale, namespace: 'a11y' });

  // The search palette's index: just enough to match and label a result.
  const paletteProjects = getAllProjects(locale)
    .filter((p) => p.status !== 'placeholder')
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      tagline: p.tagline,
      track: trackOf(p),
      terms: [...p.techStack, ...(p.skills ?? []), ...p.categoryTags].join(' ').toLowerCase(),
    }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PERSON.name,
    jobTitle: PERSON.jobTitle,
    email: `mailto:${PERSON.email}`,
    url: SITE_URL,
    image: `${SITE_URL}/icon.png`,
    worksFor: { '@type': 'Organization', name: PERSON.worksFor },
    sameAs: PERSON.sameAs,
  };

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-navy"
          >
            {t('skip_to_content')}
          </a>
          <Header projects={paletteProjects} />
          {/* The skip link focuses this. It kept outline-none, so nothing
              confirmed the jump had happened. */}
          <main
            id="main"
            tabIndex={-1}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            {children}
          </main>
          <Footer />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

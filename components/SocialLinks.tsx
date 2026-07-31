import * as si from 'simple-icons';
import { SOCIALS } from '@/lib/site';

// LinkedIn is no longer distributed by simple-icons (trademark request), so its
// mark is inlined here; GitHub and TikTok come from the library.
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z';

const BRAND_PATH: Record<string, string | undefined> = {
  github: si.siGithub?.path,
  linkedin: LINKEDIN_PATH,
  tiktok: si.siTiktok?.path,
};

function SocialGlyph({ icon }: { icon: string }) {
  const brand = BRAND_PATH[icon];
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[18px] h-[18px]">
        <path d={brand} />
      </svg>
    );
  }
  // Email — generic envelope (not a brand mark)
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="w-[18px] h-[18px]"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export default function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2.5 ${className}`}>
      {SOCIALS.map((s) => {
        const external = s.href.startsWith('http');
        return (
          <li key={s.label}>
            <a
              href={s.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="group inline-flex items-center gap-2 rounded border border-cream/15 px-3.5 py-2 text-sm text-cream/70 transition-colors hover:border-gold/50 hover:text-gold"
            >
              <span className="text-cream/50 transition-colors group-hover:text-gold">
                <SocialGlyph icon={s.icon} />
              </span>
              {s.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

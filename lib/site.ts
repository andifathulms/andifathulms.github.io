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

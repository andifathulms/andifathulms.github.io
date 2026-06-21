# CLAUDE.md — AFM Studio Portfolio Website

This file gives Claude Code the technical instructions to build the site
described in `PRD.md`. Read `PRD.md` first — this file covers *how* to build
it; the PRD covers *what* and *why*.

## Stack

- **Next.js 14+** (App Router), static export (`output: 'export'` in
  `next.config.js`) — no backend, no database, no API routes that require a
  server at runtime.
- **TypeScript** throughout.
- **Tailwind CSS** for styling.
- **next-intl** (or an equivalent lightweight route-based i18n library) for
  the `/en/` and `/id/` locale routing. Do not implement i18n as a
  client-side text-swap — every page must be a real, statically-generated
  route per locale.
- **MDX or structured Markdown + gray-matter** (or Contentlayer, or a similar
  content-as-files approach) for case study content — see "Content model"
  below. Do not hardcode project content directly into JSX components.
- **Deployment target**: Vercel (static export works fine on Vercel without
  any special config).

## Design tokens

Implement these as CSS variables / Tailwind theme extensions — do not
hardcode hex values throughout components.

```js
// tailwind.config.js theme.extend.colors
colors: {
  navy: '#0D1B2A',   // base background
  clay: '#C9603D',   // accent 1 — secondary accent, dividers, hover
  gold: '#C99A3E',   // accent 2 — primary accent, CTAs, links
  cream: '#E8E3D8',  // body text on dark backgrounds
}
```

- Dark-first design. The navy background is the default surface — do not
  build this as a light theme with a dark mode toggle; it is dark by design.
- No gradients, no drop shadows, no glow/neon effects. Flat surfaces.
- Section dividers: thin gold hairlines (`border-t border-gold/30` style),
  not boxed cards with hard borders, for the marketing/editorial pages.
- Case study quick-facts strip and stack-chip components CAN use subtle
  bordered "chip" styling (small radius, 1px border) since those are
  functional UI elements, not editorial content blocks.

## Typography

```js
// fonts — use next/font for optimization
heading: 'Fraunces' (serif) — fallback: Lora, Georgia, serif
body:    'Inter' (sans)     — fallback: 'General Sans', system-ui, sans-serif
mono:    'JetBrains Mono'   — fallback: 'IBM Plex Mono', monospace
```

- Headings use the serif (`font-heading` Tailwind class).
- Body copy, nav, buttons use the sans (`font-sans`, Tailwind default).
- Tech-stack chips, dates, tags, project metadata use the mono
  (`font-mono`).
- Limit to two font weights per family in practice — regular (400) and
  medium/semibold (500-600). Avoid heavy/black weights — they clash with the
  editorial tone described in the PRD.

## Routing structure

```
app/
  [locale]/
    layout.tsx              — locale-aware root layout, header, footer
    page.tsx                — home
    work/
      page.tsx               — case study index
      [slug]/
        page.tsx              — case study detail (generateStaticParams
                                 from content files, see Content model)
    about/
      page.tsx
    contact/
      page.tsx
```

Locale list: `['en', 'id']`. Generate static params for both at build time.
Every route must exist for both locales before this is considered complete
— do not ship with one locale partially translated.

## Content model

Project case studies live as content files, not components, per PRD Section 8:

```
content/
  projects/
    _placeholder/
      meta.json            — { slug, title, tagline, categoryTags[],
                                techStack[], status: "placeholder",
                                liveUrl: null, githubUrl: null,
                                heroImage: "/images/projects/_placeholder/hero.jpg" }
      en.mdx                — English case study body (problem/approach/outcome)
      id.mdx                — Indonesian case study body
    [future-project-slug]/
      meta.json
      en.mdx
      id.mdx
      PRD.md                — (optional) source PRD, not rendered on site
      CLAUDE.md              — (optional) source CLAUDE.md, same as above
      PORTFOLIO_CONTEXT.md   — (optional) distilled context file, same as above
```

- `meta.json` drives the quick-facts strip, the work-index card, and
  conditional rendering of "View live" / "View on GitHub" buttons.
- `en.mdx` / `id.mdx` follow the Section 6.3 case study template.
- `PRD.md` / `CLAUDE.md` / `PORTFOLIO_CONTEXT.md` inside a project folder are
  **source material only** — never rendered on the public site.
- Build the case study page component to read whatever projects exist in
  `content/projects/` and generate routes dynamically.

## Components to build

- `Header` — wordmark, nav links, locale switcher.
- `Footer` — three-column layout.
- `Hero` — home page hero with positioning statement + two CTAs.
- `ServiceCard` — small card for the services grid.
- `ProjectCard` — thumbnail, title, tagline, category tags, tech stack chips.
- `CaseStudyLayout` — shared layout for `/work/[slug]` pages.
- `QuickFactsStrip` — role / timeframe / stack chips / action links / private badge.
- `TechStackChips` — reusable small pill row, mono font.
- `ProcessSection` — home page section explaining the workflow.
- `LocaleSwitcher` — EN/ID text toggle, preserves current path.

## Things to explicitly NOT build

- No backend, no API routes requiring a server, no database.
- No contact form — contact page is `mailto:` + WhatsApp links only.
- No CMS or admin UI.
- No guestbook or comments.
- No live third-party API integrations.
- No logo icon/mark — styled wordmark text only.

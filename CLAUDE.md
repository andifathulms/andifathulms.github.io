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

`DESIGN.md` is the source of truth for the visual system; the tokens live in
the `@theme` block of `app/globals.css` (Tailwind v4). Do not hardcode hex
values in components.

```css
--color-navy:   #0A1520;  /* page background (archival ink)            */
--color-deck:   #0F1D2B;  /* raised surface: featured rows, panels      */
--color-deck-2: #14263A;  /* surface inside a deck: chips, code         */
--color-gold:   #E0AE52;  /* act here: primary CTA, links, active state */
--color-clay:   #E07A56;  /* government track marker                    */
--color-lagoon: #6FB8AB;  /* independent lab marker, "Live" status      */
--color-cream:  #EEE8DC;  /* text                                       */
```

- Dark-first design. Navy is the page; there is no light theme or toggle.
- No gradients, no drop shadows, no glow/neon effects. Depth comes from the
  navy → deck → deck-2 surfaces and hairline borders only.
- Section dividers are neutral hairlines (`border-t border-line`).
- Bordered chips are for filters, skills and the full stack list on case
  studies. Project cards use a single label line instead.

## Typography

```js
// fonts — loaded with next/font/google in app/[locale]/layout.tsx
heading: 'Fraunces' (variable, SOFT + opsz axes) — fallback: Lora, Georgia, serif
body:    'Geist' (sans)                          — fallback: Inter, system-ui, sans-serif
mono:    'Geist Mono'                            — fallback: 'JetBrains Mono', monospace
```

- Headings use the serif (`font-heading`) at weight 400 (`font-normal`).
- Body copy, nav, buttons and category labels use the sans (`font-sans`).
- Numbers, dates, timeframes and kicker labels use the mono (`font-mono`).
- Weights: 400–600. Never heavier.

## Routing structure

```
app/
  [locale]/
    layout.tsx              — locale-aware root layout, header, footer
    page.tsx                — home
    lab/
      page.tsx               — independent project index (grid / list, search)
    cv/
      page.tsx               — printable HTML résumé built from the manifests
    work/
      page.tsx               — government systems (feature rows)
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
- **Copy follows `VOICE.md`.** Read it before writing or editing any case study,
  tagline or UI string. Case studies use the sections it defines (The problem /
  What I built / Result / Under the hood, and their Indonesian
  equivalents). `meta.json` carries `glance`, `skills`, impact-first `metrics`,
  and an `id` block with the Indonesian versions of those fields plus the
  tagline. Run `npm run lint:voice -- <slug>` after editing.
- **New or updated project facts arrive as `PORTFOLIO_CONTEXT.md` (schema
  `portfolio-context/v2`)**, exported from each project's own repo with
  `docs/portfolio-intake/EXPORT_PROMPT.md`. Turn them into site copy with the
  `portfolio-intake` skill (`/portfolio-intake <slug>`, or no slug for all
  pending). Never write case-study copy from a context that fails
  `npm run check:context -- <slug>`.
- Build the case study page component to read whatever projects exist in
  `content/projects/` and generate routes dynamically.

## Components to build

- `Header` — logo mark + wordmark, nav links, locale switcher.
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
- Header wordmark pairs the brand mark (`public/images/brand/logo-mark.svg` — navy square,
  gold corner brackets, serif "A") with the "AFM Studio" text, per the exported
  `exports/afmstudio/` lockup set. Favicon/apple-icon use the same mark
  (`app/icon.png`, `app/apple-icon.png`). Don't introduce a second, different
  mark elsewhere — this is the one logo for the site.

## Project asset sizes

- `public/images/projects/<slug>/icon.webp` — **128×128 WebP**. Icons render at
  32px on cards and 56px on case study headers, so 128 covers 2× DPR with
  headroom. They were once 512–1024px PNGs totalling 1.78 MB for 35 projects;
  `images.unoptimized` is required for static export, so whatever is committed
  is what ships byte-for-byte. Size a new project's icon before committing it.
- `getProjectIcon()` resolves `svg → png → webp` in that order, so don't leave a
  large PNG beside a small WebP — the PNG wins.

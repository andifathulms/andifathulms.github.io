# PRD — AFM Studio Portfolio Website

## 1. Overview

AFM Studio is the freelance/personal brand portfolio site for Andi Fathul Mukminin
Salahuddin (Fathul) — a fullstack developer working across government digital
transformation (OIKN), startup product development (TOGA POS co-founder), and
independent data/content work.

The site's job is to convert visiting clients (freelance/contract prospects) into
inquiries by demonstrating range and credibility: production systems built for a
sovereign capital authority, a self-founded startup with real users, and a set of
self-directed technical projects that show genuine curiosity beyond client work.

This is **not** a developer-community portfolio (no guestbook, no blog-first
identity). It is a client-facing credibility site, first and foremost.

## 2. Audience

Primary: freelance/contract clients — mixed (Indonesian SMEs/startups,
international clients, occasional institutional/government-adjacent work).
They are evaluating: "can this person solve my problem, communicate clearly,
and deliver."

Secondary: professional network, potential collaborators, people who find
Fathul via his TikTok BPS/PDRB data content and want to see his technical work.

## 3. Brand

- **Name**: AFM Studio
- **Domain**: afmstudio.dev (pending confirmation — fallback options: afm.studio,
  afmstudio.io, afmstudio.id)
- **Logo**: styled wordmark only for v1 ("AFM Studio" in the heading typeface).
  No icon/mark yet — to be added in a future iteration. Do not over-invest in
  logo treatment now.
- **Positioning line** (example, refine in copywriting pass):
  "Fullstack systems for governments, startups, and everyone between."

## 4. Visual identity

### Palette ("Clay & Archipelago" hybrid)
Dark, editorial, premium — not a typical light SaaS dev-portfolio look.

| Token | Hex | Usage |
|---|---|---|
| `navy` (base/background) | `#0D1B2A` | primary background, dark surfaces |
| `clay` (accent 1) | `#C9603D` | secondary accent, line dividers, hover states |
| `gold` (accent 2) | `#C99A3E` | primary accent — CTAs, links, highlights, badges |
| `cream` (text on dark) | `#E8E3D8` | body text on navy backgrounds |

Notes:
- This is a **dark-first** design. Do not default to a light theme.
- Avoid gradients, drop shadows, neon/glow effects — flat, confident surfaces.
- Gold hairline dividers between sections instead of hard borders/cards.
- Avoid any color/branding overlap with OIKN's "Nusantara" design system
  (khatulistiwa blue #185088, terakota gold #DBAF6C, pertiwi cream, buana dark)
  — this is a deliberately distinct personal/freelance identity, not a
  government-affiliated one, even though the palette concept (navy+gold+clay+cream)
  shares a similar warm/editorial spirit by coincidence of taste, not branding intent.

### Typography
- **Headings**: serif with character — Fraunces or Lora (or close equivalent).
  Conveys warmth/craft, pairs with the clay/gold accents.
- **Body / UI**: clean sans — Inter or General Sans. Technical legibility.
- **Labels / tags / dates / tech-stack chips**: monospace (e.g. JetBrains Mono
  or similar) — reinforces the "documents everything, ships precisely" identity.
- Two weights max per family in practice (regular + medium/semibold) — avoid
  heavy weights that clash with the editorial tone.

### Layout principles
- Generous vertical rhythm, full-bleed section breaks, confident large type.
- Case study pages should read like a magazine spread, not a SaaS feature page.
- No busy multi-column dashboards — whitespace does a lot of the work here.

## 5. Information architecture

Multi-page site. Fully bilingual via route-based i18n (not a client-side text
swap) — every page exists at both `/en/...` and `/id/...`.

```
/[locale]/                       Home (hero, services, featured work preview,
                                  process, about teaser, CTA)
/[locale]/work                   Case study index (grid/list of all projects)
/[locale]/work/[project-slug]    Dedicated case study page per project
/[locale]/about                  About / bio page
/[locale]/contact                Contact page
```

Locale switch: `en` / `id`, persisted via URL path. No locale-based content
hiding — every page must have both translations before launch.

## 6. Page content specs

### 6.1 Home
- Hero: one-line positioning statement + sub-line + two CTAs ("See my work",
  "Start a project")
- Services section: 4-6 short service cards (web apps, government/enterprise
  systems, data platforms & dashboards, POS/SaaS MVPs, DevOps/infra) — one
  line each, no paragraphs.
- Featured work: 3-4 project teaser cards linking to full case studies.
- Process section: brief explanation of the PRD → CLAUDE.md → Claude Code
  delivery workflow, framed as a client benefit (clear scoping, full
  documentation, fast iteration) — not as an "I use AI" gimmick.
- About teaser + link to full About page.
- Closing CTA section before footer.

### 6.2 Work index (`/work`)
- Grid/list of all case studies with: project name, one-line tagline, category
  tags, thumbnail image, tech stack chips.
- Filterable by category if project count grows beyond ~6 (not required for v1
  with 3-4 projects).

### 6.3 Case study page (`/work/[slug]`)

**This is the most important template in the site.** Each project gets a
dedicated page with this structure:

1. **Header**: project name, one-line tagline, category tags
   (e.g. "Government", "Data Pipeline", "Startup"), hero banner image.
2. **Quick facts strip**: role, timeframe, stack (as chips), and action
   links — "View live" (if deployed) and "View on GitHub" (if public repo
   exists). If a project is private/internal (common for government work),
   omit these buttons entirely and show a "Private / internal system" badge
   instead — never show dead/broken links.
3. **The problem**: what need existed, who it was for. Sourced from the
   project's PRD context/background section.
4. **The approach**: architecture decisions, why this stack, notable
   technical choices. Sourced from the project's CLAUDE.md technical
   decisions and from PORTFOLIO_CONTEXT.md (see Section 8).
5. **Visuals**: 2-4 screenshots (annotated where useful), plus an
   architecture diagram where the system has real pipeline/integration
   complexity worth showing (e.g. a data pipeline, multi-service system).
6. **Outcome / impact**: what changed as a result — concrete or soft
   outcomes ("reduced manual reporting time," "enabled X team to do Y").
   This section is the actual conversion driver for client visitors and
   must not be skipped even when the source PRD doesn't explicitly state
   outcomes — write 2-3 sentences minimum per project.
7. **Tech stack footer**: full tag row of tools/technologies used.
8. **Next project** navigation at page bottom.

### 6.4 About
- Short personal bio + photo (content supplied by Fathul directly).
- Should connect the throughline across government work, startup
  founding, and data/content creation as one coherent identity — not three
  disconnected résumé lines.

### 6.5 Contact
- No backend form. Just direct contact methods:
  - `mailto:` link
  - WhatsApp link
- Keep this page short — one clear CTA, not a form to fill out.

## 7. Navigation & footer

**Header nav**: `AFM Studio` wordmark (links home) — `Work` / `About` /
`Contact` — language toggle (text-based `EN` / `ID`, no flags) at the right.

**Footer**: three columns —
- Left: short tagline + copyright line.
- Middle: quick links (Work, About, Contact).
- Right: social links (GitHub, LinkedIn, TikTok, email) + a small
  "currently building: [active project]" line, manually updated occasionally.

## 8. Project case study content pipeline (IMPORTANT — read before generating
   project pages)

**This PRD currently ships with PLACEHOLDER project content only.** Do not
treat the placeholder project in `/content/projects/_placeholder/` as a real
case study to launch with — it exists solely to validate the page template
renders correctly with realistic-length content.

The real project list will be added incrementally, **one project at a time**,
each via a folder containing up to three source files:

```
/content/projects/[project-slug]/
  PRD.md                  — that project's own product requirements doc
  CLAUDE.md                — that project's own technical/build instructions
  PORTFOLIO_CONTEXT.md     — a distilled summary generated specifically for
                             portfolio case-study writing (see template below)
```

When new project folders are added, Claude Code should:
1. Read all available files for that project (not all three are guaranteed
   present — PORTFOLIO_CONTEXT.md may be missing for older projects).
2. Generate the case study content (problem / approach / outcome / stack /
   suggested screenshots) following the Section 6.3 template.
3. Write bilingual copy (EN + ID) for that case study.
4. Add the project to the `/work` index in both locales.
5. **Never invent links** — only include "View live" / "View on GitHub"
   buttons if explicitly confirmed available in the source files; otherwise
   use the private/internal badge.
6. Flag (don't silently omit) any project that appears to involve
   government/internal-system sensitive details, so Fathul can review before
   publishing.

`PORTFOLIO_CONTEXT.md` template (generated separately, per project, by
running Claude Code inside that project's own repo):

```
1. One-line summary
2. The problem
3. My role
4. Technical approach
5. Actual tech stack (verified against the codebase, not just the PRD)
6. Notable features (4-6 bullets)
7. Challenges/tradeoffs
8. Status (deployed? public/private repo?)
9. Metrics if available
10. Suggested screenshots (with file paths to relevant components)
```

Expect 3-4 initial case studies at launch, added incrementally. The site
structure, components, and i18n setup must be built generically enough to
accept new project folders without code changes — content-driven, not
hardcoded per project.

## 9. Technical requirements

- **Framework**: Next.js (static export / SSG, no backend, no database).
- **i18n**: route-based locale switching (`/en/...`, `/id/...`), e.g. via
  `next-intl` or equivalent.
- **Content**: project case studies and other long-form content should be
  authored as MDX or structured Markdown files (one folder per project, per
  Section 8) — not hardcoded in JSX — so new projects can be added by
  dropping in files rather than editing components.
- **Hosting**: Vercel.
- **Forms**: none — contact page uses `mailto:` and WhatsApp links only.
- **Images**: screenshots stored as static assets, optimized via Next.js
  Image component.
- **Performance**: target high Lighthouse scores across the board (90+ all
  categories) — this is a portfolio site, performance is itself part of the
  pitch.
- **Accessibility**: standard semantic HTML, proper alt text on all
  screenshots, sufficient contrast on the dark navy palette (verify gold/clay
  text-on-navy combinations meet WCAG AA).

## 10. Out of scope (v1)

- No CMS / admin panel — content is file-based.
- No guestbook, comments, or any user-generated content.
- No analytics dashboard beyond basic page-view tracking (optional, e.g.
  Vercel Analytics) — no GitHub/WakaTime live API integrations like the
  FlexForge reference template.
- No blog (separate from case studies) — Fathul's existing blog
  (InsightfulBytes) stays separate; link out to it if relevant, don't
  duplicate it here.
- No e-commerce, payments, or account system.

## 11. Success criteria

- Site clearly communicates range (government + startup + independent
  technical work) without feeling like three disconnected portfolios.
- A prospective client can understand what Fathul does, see relevant proof,
  and reach out within one page visit.
- New case studies can be added by dropping in content files, without
  touching layout code.
- Both locales are complete and equally polished — no "EN is the real site,
  ID is an afterthought" feeling, or vice versa.

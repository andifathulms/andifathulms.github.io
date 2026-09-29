# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary (decided 29 Sep 2026): recruiters and hiring managers evaluating
Fathul for a role. They give the site about a minute. They need to see who he
is, where he works, what he is open to, and proof that he ships — and they
need a CV one click away. Most of them are not engineers.

Secondary: freelance/contract clients — Indonesian SMEs/startups,
international clients, and occasional institutional work. Same questions,
plus "can he solve my problem".

Tertiary: professional network, potential collaborators, and people who
discover Fathul through his TikTok BPS/PDRB (Indonesian statistics) data
content and want to see the technical work behind it.

## Product Purpose

AFM Studio is the personal/freelance portfolio site for Andi Fathul
Mukminin Salahuddin (Fathul), a fullstack developer working across
government digital transformation (Otorita IKN — the authority building
Indonesia's new capital, Nusantara) and independent data/content work.

The site's job is to turn a recruiter's or client's first minute into a
conversation by demonstrating range and credibility: production systems built for a
sovereign capital authority, and a set of self-directed technical projects
that show genuine curiosity beyond client work. It is explicitly a
credibility site for people deciding whether to hire him, not a developer-community portfolio — no
blog-first identity, no guestbook.

Success is a recruiter or client opening the CV or reaching out via the
contact page.

## Positioning

"I build government systems for Indonesia's new capital" (home hero, since
Sep 2026; it replaced the agency-style "Fullstack systems for governments,
startups, and everyone between"). The site is organised as two tracks with
one person behind them: **Work** (government systems for Otorita IKN) and
**Lab** (independent projects). The throughline is one person who ships production software end-to-end
(PRD → technical spec → build → deploy) across two very different
operating contexts: high-compliance government platforms (SSO, audit
trails, procurement constraints) and fast-moving independent/startup
work. Few portfolios can truthfully claim both a sovereign-capital-authority
production track record and a self-founded startup and a body of
self-directed technical explainers in the same body of work.

## Operating Context

- Fathul is a civil servant (ASN) at Otorita IKN, in the Directorate of
  Data and Artificial Intelligence, based in Nusantara, Indonesia.
- The portfolio's project content pipeline is folder-based
  (`content/projects/<slug>/meta.json` + `en.mdx` + `id.mdx`, with optional
  source `PRD.md` / `CLAUDE.md` / `PORTFOLIO_CONTEXT.md` that are never
  rendered publicly). 53 projects are documented today, spanning
  government platforms, a self-founded startup, and independent technical
  tools/explainers/games.
  - Government/internal projects that appear to involve sensitive details
    are flagged for Fathul's review before publishing, never silently
    included or omitted.
- The site is fully bilingual (EN/ID) via route-based i18n
  (`/en/...`, `/id/...`) — every page must exist in both locales before
  it ships; no locale-based content hiding.
- Site statistics on the About page (systems shipped, government vs.
  independent counts, live count, tech-stack usage) are computed from the
  project manifests, not hand-maintained, so they stay accurate as
  projects are added.

## Capabilities and Constraints

- Static export only — no backend, no database, no API routes requiring
  a server at runtime, no CMS/admin UI, no live third-party API
  integrations.
- Contact page is `mailto:` + WhatsApp links only — no contact form, no
  guestbook, no comments.
- Case studies must never show a dead or broken "View live" / "View on
  GitHub" link — those buttons render only when explicitly confirmed
  available in a project's source files; otherwise a "Private / internal
  system" badge is shown instead.
- Deploy target: GitHub Pages user site, currently live at
  `https://andifathulms.github.io` (deployed via GitHub Actions on push to
  `main`). No custom domain is planned — this is the confirmed final
  production URL, not a placeholder. (The original PRD's `afmstudio.dev`
  custom-domain plan is superseded by this decision.)
- Optional, privacy-respecting analytics via GoatCounter, enabled only
  when a `GOATCOUNTER_URL` repo variable is set; disabled by default.
- No formal accessibility standard (e.g. no mandated WCAG level) is
  required — general good practice applies, but there is no specific
  compliance target or documented user need to design around.

## Brand Commitments

- Name: AFM Studio. Site title/wordmark pairs the brand mark
  (`public/images/brand/logo-mark.svg`) with "AFM Studio" text — one logo
  system, not duplicated elsewhere.
- Deliberately visually distinct from OIKN's "Nusantara" government design
  system (khatulistiwa blue, terakota gold, pertiwi cream, buana dark) —
  the navy/gold/clay/cream palette here is personal/freelance identity,
  not government-affiliated, despite a coincidentally similar warm/editorial
  spirit.
- Voice: defined in `VOICE.md` — plain, first person, specific, people
  before systems. The process (spec → build with Claude Code → review) is
  stated once, plainly, on About and in How I work: "I write a spec for
  every project, then build with Claude Code as my pair. The decisions, the
  review and the result are mine." It is not repeated as a badge on every
  project.
- Social channels: GitHub, LinkedIn, TikTok, email — surfaced in the
  footer and About page.

## Evidence on Hand

- 53 real, documented project case studies under `content/projects/`
  (government platforms, a self-founded startup, and independent
  tools/data platforms/explainers/games), each sourced from that
  project's own PRD/CLAUDE.md/PORTFOLIO_CONTEXT.md where available.
- About-page stats (systems shipped, government/independent split, live
  count, per-technology usage counts) are computed from real project
  manifests, not asserted copy.
- **Deliberate absence, confirmed by the user**: no testimonials, client
  logos, or third-party proof exist or are expected soon. The case
  studies and computed stats are the only proof this site has. Future
  work must not fabricate testimonials, client logos, review quotes, or
  similar third-party endorsements.
- About-page bio photo is optional/conditional (falls back to an "AF"
  monogram when `public/images/about/photo.jpg` is absent) — supplied by
  Fathul directly, not to be invented.

## Product Principles

- Never show a dead or broken link, and never invent one — private/
  internal work gets a badge, not a fabricated "View live" button.
- Claims should be countable, not asserted — prefer stats and facts
  derived from real project data (as the About page's stack-usage counts
  already do) over hand-written superlatives.
- Two operating contexts, one coherent identity — government-grade
  discipline and independent/startup speed are presented as the same
  throughline, not three disconnected résumé lines.
- Documentation is part of the pitch — the PRD → CLAUDE.md → build
  process is shown as evidence of how Fathul works, because this site
  itself was built that way.
- Flag sensitive government/internal content for review rather than
  silently publishing or silently omitting it.

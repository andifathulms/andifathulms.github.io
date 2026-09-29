---
name: AFM Studio
description: A dark, editorial portfolio for a fullstack developer working across government and independent projects — the Bound Ledger, opened up.
colors:
  navy: "#0A1520"
  deck: "#0F1D2B"
  deck-2: "#14263A"
  gold: "#E0AE52"
  clay: "#E07A56"
  lagoon: "#6FB8AB"
  cream: "#EEE8DC"
  text: "#EEE8DC"
  text-prose: "#CBCCC6"
  text-muted: "#A2ABB0"
  text-subtle: "#8A949B"
  accent: "#E0AE52"
  accent-2: "#E07A56"
  accent-3: "#6FB8AB"
  line: "#1D3045"
  line-strong: "#2B425A"
  line-muted: "#17283A"
  edge: "#2B425A"
  edge-strong: "#3E5873"
  edge-accent: "rgba(224, 174, 82, 0.55)"
typography:
  display:
    fontFamily: "var(--font-fraunces), Lora, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.02
    variation: "opsz auto, SOFT 50, tracking -0.015em to -0.025em"
  h1:
    fontFamily: "var(--font-fraunces), Lora, Georgia, serif"
    fontSize: "clamp(2.25rem, 4.6vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.05
  h2:
    fontFamily: "var(--font-fraunces), Lora, Georgia, serif"
    fontSize: "clamp(1.875rem, 3.2vw, 2.375rem)"
    fontWeight: 400
    lineHeight: 1.15
  h3:
    fontFamily: "var(--font-fraunces), Lora, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.3
  stat:
    fontFamily: "var(--font-fraunces), Lora, Georgia, serif"
    fontSize: "clamp(2rem, 3.5vw, 2.75rem)"
    fontWeight: 400
    lineHeight: 1
  lead:
    fontFamily: "var(--font-geist), Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "var(--font-geist), Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  meta:
    fontFamily: "var(--font-geist-mono), 'JetBrains Mono', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.05em"
rounded:
  chip: "0.25rem"
  control: "0.5rem"
  media: "0.75rem"
  photo: "1rem"
  pill: "9999px"
spacing:
  gutter: "1.5rem"
  stack: "3rem"
  section-tight: "4.5rem"
  section: "6rem"
  hero-top: "8rem"
  page-top: "7rem"
  touch: "2.75rem"
---

# Design System: AFM Studio

## Overview

**Creative North Star: "The Bound Ledger, opened up"**

The site still reads like a precise document made warm: hairline rules like
ruled paper, gold like foil-stamped credentials, navy like archival ink. The
first version of this system kept everything on one flat surface with gold on
almost every label, and the result was dim and uniform — 53 projects that all
looked equally important. This version keeps the identity and adds three
things: a raised surface for what deserves attention, a colour for each of the
two tracks of work, and a type treatment with more contrast between display
and body.

It is still dark-first, not a dark mode of something else. It is still flat:
no shadows, no gradients, no glow, no glassmorphism.

**Key characteristics**

- Two tracks, one person. Government work (clay) and the independent lab
  (lagoon) each have their own page and their own marker colour.
- Three surfaces: navy for the page, deck for featured panels and cards,
  deck-2 for chips and code inside a deck.
- Gold means one thing: act here.
- Fraunces for display, set light and soft. Geist for reading and UI. Geist
  Mono for data only.
- Screenshots are the hero of every project. They get generous corners and
  appear above the fold.

## Colors

Every colour has one job. If a new element needs colour, it takes one of these
jobs or it stays neutral.

| Token | Hex | Job |
| --- | --- | --- |
| `navy` | `#0A1520` | Page background (archival ink) |
| `deck` | `#0F1D2B` | Raised surface: featured rows, at-a-glance panel, card thumbnails |
| `deck-2` | `#14263A` | Surface inside a deck: skill chips, inline code, segmented-control active state |
| `gold` / `accent` | `#E0AE52` | Primary CTA fill, links, active nav, focus ring |
| `clay` / `accent-2` | `#E07A56` | Government track marker |
| `lagoon` / `accent-3` | `#6FB8AB` | Independent lab marker, "Live" status |
| `cream` / `text` | `#EEE8DC` | Headings and UI text |
| `text-prose` | `#CBCCC6` | Long-form reading in case studies |
| `text-muted` | `#A2ABB0` | Secondary copy, taglines |
| `text-subtle` | `#8A949B` | The dimmest text allowed |
| `line` family | `#1D3045` → `#3E5873` | Hairlines and control borders, neutral blue-grey |

Contrast is recorded in `app/globals.css` against all three surfaces. Every
text token clears 4.5:1 on navy, deck and deck-2.

### Named rules

**The One Voice Rule.** Gold is the only colour that says "act here" or "you
are here". Two competing gold elements on one screen is a bug.

**The Track Rule.** Clay and lagoon are markers, not decoration. They appear as
a small square (8px, 2px radius) or a dot next to a track label, as the
top-left rule of a track section, and on the "Live" pill (lagoon). They never
fill a large area and never colour body text.

**The Contrast Floor Rule.** No text below 4.5:1. Never use `text-cream/NN`,
`text-gold/NN` or `text-clay/NN` for text. Use the semantic tokens.

## Typography

- **Display and headings: Fraunces**, variable, with `opsz` on auto and
  `SOFT 50`, weight 400, tracking −1.5% (−2.5% at hero size). The `.font-heading`
  base rule applies the variation settings. At large sizes the soft,
  high-contrast cut is what makes it editorial; at weight 500 with default
  optical size it looked heavy and generic. Italic in gold is allowed once per
  page, on the one word that matters (the home hero's "new capital").
- **Body and UI: Geist**, 400 / 500 / 600. Case-study `###` headings are Geist
  600, so a page has one serif voice (the `##` sections) and one sans voice
  (the decisions under them).
- **Data: Geist Mono**, 400 / 500. Numbers, dates, timeframes, commands,
  kicker labels. Category labels on cards are no longer mono; they are
  sentence-case Geist next to a track marker.

### Hierarchy

| Role | Size | Notes |
| --- | --- | --- |
| Display | clamp(40px, 6vw, 72px) / 1.02 | Home hero only |
| H1 | clamp(36px, 4.6vw, 56px) / 1.05 | Page titles, case-study titles |
| H2 | clamp(30px, 3.2vw, 38px) / 1.15 | Sections, case-study `##` |
| H3 | 22px / 1.3 | Card titles |
| Stat | clamp(32px, 3.5vw, 44px) / 1 | Numerals in metrics and hero facts |
| Lead | 18px / 1.65 | Hero sub-line, taglines on case studies |
| Body | 16px / 1.7 | Floor for prose |
| Meta | 14px / 1.45 | Kickers, chips, dates. Floor for functional text |

## Layout

- `max-w-page` is 1152px (was 1024px) so the government feature rows can put a
  large screenshot beside their text. `container-doc` (768px) and
  `container-prose` (672px) are unchanged.
- Vertical rhythm is unchanged: `section` 96px, `section-tight` 72px, `stack`
  48px, header 64px.
- Sections are separated by `border-t border-line` hairlines. Featured content
  sits on a `deck` panel with a hairline border and `rounded-media`.

## Elevation and depth

Depth comes from tone and hairlines, never from shadows. The order is navy →
deck → deck-2. A hover raises a border from `line` to `line-strong` (or to
`edge-accent` when the element is the primary action) and, on media, zooms the
image by 3% inside its frame. No shadow, blur-based elevation, gradient or glow
anywhere. The header and lightbox may use `backdrop-blur-sm` over a near-opaque
navy, which is a legibility aid, not elevation.

## Shapes

| Radius | Value | Used for |
| --- | --- | --- |
| `rounded` | 4px | Chips, tags, kbd |
| `rounded-control` | 8px | Buttons, inputs, segmented controls |
| `rounded-media` | 12px | Screenshots, thumbnails, deck panels |
| `rounded-2xl` | 16px | About portrait only |
| `rounded-full` | pill | Status only: "Live", availability |

**The Pill Rule.** A pill shape is a status claim ("Live", "Open to work"). A
filter or category is never a pill.

## Components

### Buttons

- **Primary:** `bg-gold text-navy rounded-control px-5 py-3 text-sm font-medium`,
  hover `bg-gold/90`. One per screen.
- **Secondary:** transparent, `border border-edge text-cream`, hover
  `border-edge-strong`.
- **Focus:** 2px solid gold outline, 3px offset, on every interactive element.
- **Touch:** `min-h-touch` (44px) on every control.

### Project card (`ProjectCard`)

Screenshot (16:10, `rounded-media`, deck background, 3% zoom on hover), then a
single label line: track marker + problem type in sentence-case Geist, year in
mono on the right. Then the title (Fraunces, h3), the tagline (two lines,
clamped), and the top three technologies as quiet text joined by " · ". "Live"
is a lagoon pill on the image. Private work shows a quiet lock label instead.
No bordered chips on cards.

### Flagship row (`FlagshipRow`)

The government track's large format: a 16:10 screenshot beside a text column
with a mono kicker (timeframe · role), the title at h2 size, the tagline, an
impact strip of two or three metrics separated by hairlines, the first skills,
and a "Read the case study →" link. Rows alternate image side on desktop.

### At-a-glance panel

On every case study, beside the hero screenshot: a deck panel with a gold mono
kicker and a definition list — For, My role, Built, Result, Skills (deck-2
chips) — and the live, staging or GitHub actions. It is the 30-second version of
the case study.

### Chips

Filters, skills and the full stack on case studies keep chips: `rounded`
(4px), hairline border, Geist at `text-meta`. Active filter:
`border-edge-accent text-gold bg-gold/10`.

### Navigation

Fixed header, `bg-navy/90 backdrop-blur-sm`, hairline bottom border. Links:
Work · Lab · About · CV, then a gold "Contact" button and the EN / ID switch.
Active link is cream with a gold underline. `⌘K` / `Ctrl K` opens the project
search palette from anywhere.

### Signature motion

- **Arrow reveal:** `→` slides in on hover of a title or link that leads
  somewhere. Keep using it.
- **Image drift:** media zooms 3% inside its frame on hover, 500ms ease.
- Everything is wrapped in `motion-reduce` guards.

## Do's and don'ts

**Do**

- Give government work the larger stage. Put the impact number first.
- Show a screenshot above the fold on every project page.
- Use the track colours only as markers.
- Use `text-prose` for long reading and `text-muted` for supporting copy.
- Keep gold to one primary action per screen.

**Don't**

- Don't add shadows, gradients, glow or glassmorphism.
- Don't put bordered chips on cards.
- Don't use mono for prose or category labels.
- Don't use weights above 600, or Fraunces above 500.
- Don't drift toward a light SaaS portfolio, or toward OIKN's "Nusantara"
  government palette (khatulistiwa blue, terakota gold, pertiwi cream). This is
  a personal identity.

## Copy

How the site reads is defined in `VOICE.md`.

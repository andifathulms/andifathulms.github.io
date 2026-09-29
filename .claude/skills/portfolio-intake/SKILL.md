---
name: portfolio-intake
description: Turn a project's PORTFOLIO_CONTEXT.md (schema portfolio-context/v2) into its case study on the AFM Studio site — meta.json, en.mdx and id.mdx — following VOICE.md. Use when the user runs /portfolio-intake, says a project's portfolio context was updated or exported, asks to add a new project to the portfolio, or asks to process pending contexts.
---

# Portfolio intake

You are updating the AFM Studio portfolio from a fact sheet. The fact sheet is
`content/projects/<slug>/PORTFOLIO_CONTEXT.md`, written in another repository
by the prompt in `docs/portfolio-intake/EXPORT_PROMPT.md`. Your output is three
files in the same folder: `meta.json`, `en.mdx`, `id.mdx`. Nothing else changes
unless a step below says so.

Follow the steps in order. Do not skip the checks. When a step says STOP, stop
and ask the user; don't guess.

## Arguments

- `/portfolio-intake <slug>` — one project.
- `/portfolio-intake` with no slug — run `node scripts/check-context.mjs --pending`
  and process every pending project, one at a time, one commit each.

## Step 1 — Validate the fact sheet

Run `node scripts/check-context.mjs <slug>`.

- Any **error**: STOP. Show the errors. A schema error usually means the
  context must be re-exported with the current prompt. A secret or IP error
  means the file must be fixed at the source; never copy that content anywhere.
- **Warnings**: note them for the final report and continue.

## Step 2 — Read, in this order

1. `VOICE.md` — all of it. The rules there are not optional.
2. `content/projects/<slug>/PORTFOLIO_CONTEXT.md` — the facts.
3. The current `meta.json`, `en.mdx`, `id.mdx` for this slug, if they exist.
4. Reference shape and tone, all three files each:
   - `content/projects/lantara/` for government work,
   - `content/projects/pola-hujan/` for lab work.

Then write down, before any prose: every number and date in the fact sheet's
frontmatter and sections 5 and 8. This list is the only source of numbers you
may use. Section 9 lists what you must not publish.

## Step 3 — Decide new or update

- **New project** (no `meta.json`): build every field from the mapping below.
- **Update**: change only what the mapping marks as *from context*. Keep
  `order`, `featured`, `heroImage` and extra `categoryTags` as they are unless
  the user asked otherwise.
- STOP if the context's `track` differs from the current track (a government
  project becoming lab or the reverse) — confirm with the user first.

## Step 4 — meta.json mapping

| meta.json field | Rule |
| --- | --- |
| `slug` | frontmatter `slug` (must equal the folder name) |
| `title` | from context: `title` |
| `tagline` | write it: VOICE.md tagline formula, ≤ 18 words, no em-dash, no final full stop, no stack names. Built from section 1. |
| `glance.for` | write it from section 2: who uses it, ≤ 12 words |
| `glance.result` | write it from status + section 5: the outcome in one line, ≤ 14 words |
| `skills` | write 3–4 recruiter-searchable skills from sections 4 and 7 (e.g. "Workflow engines", "Geospatial data"). Not library names. |
| `categoryTags` | must contain `"Government"` if and only if `track` is `government`. New lab projects: `["Personal Project", "Web App"]`. New government projects: `["Government", "Web App"]`. Keep existing extra tags. |
| `problemShape` | from context |
| `techStack` | from context, same order |
| `status` | `live`, `staging`, `internal` → `"active"`; `private`, `unreleased` → `"private"` |
| `role` | from context `role`, in Title Case ("Solo Developer", "Fullstack Developer") |
| `timeframe` | from `timeframe`: same month → `"Aug 2026"`; same year → `"May – Jul 2026"`; across years → `"Dec 2025 – Feb 2026"`; ongoing → `"Jun 2025 – present"`. En dash with spaces. Three-letter English months. |
| `liveUrl` | `live`/`internal` → `liveUrl`; `staging` → `stagingUrl`; `private`/`unreleased` → `null` |
| `liveIsStaging` | `true` only when status is `staging`; otherwise omit the key |
| `access` | from context |
| `githubUrl` | from context (`null` if private) |
| `heroImage` | update: keep. New: `/images/projects/<slug>/hero.webp` if that file exists, else `/images/projects/<slug>/cover.svg` and tell the user a hero screenshot is needed. |
| `order` | update: keep. New: highest existing `order` + 1. |
| `featured` | update: keep. New: `false`. |
| `metrics` | 3–4 rows from section 5 with kind `impact` or `scale` only, most meaningful first. `value` copied exactly; `label` lowercase, 3–8 words, no final full stop, doesn't repeat the value. Never `effort` or `target` rows. |
| `id` | Indonesian `tagline`, `glance`, `skills`, `metrics` (same count and same values as `metrics`, values may use Indonesian number formatting). |
| `source` | `{ "schema": "portfolio-context/v2", "generated": "<frontmatter generated>" }` — this marks the context as taken in. |

Key order: `slug, title, tagline, glance, skills, categoryTags, problemShape,
techStack, status, role, timeframe, liveUrl, liveIsStaging, access, githubUrl,
heroImage, order, featured, metrics, id, source`. Two-space indent, UTF-8 (no
`\u` escapes), trailing newline. Validate it parses.

## Step 5 — en.mdx

Exactly this shape (VOICE.md "Case study shape"):

```
# <title>

## The problem
<from sections 1–2: who has the problem, what it costs them, what existed before. 80–130 words. No stack names, no code.>

## What I built
### <decision 1 from section 4, as a plain sentence>
<what I chose, why, what it made possible. 50–100 words.>
### <decision 2> …  (3–5 of these)

## Result
<status in plain words (live / public staging / internal, login required / private), who uses it, scale, what changed. Numbers from section 5. 60–120 words. End with when it was built, from the timeframe.>

## What I'd do next
<only if section 6 has items: 2–3 bullets, taken from section 6. Omit the whole section if section 6 says none.>

## Under the hood
<bullets from section 7, plus the effort rows from section 5 (commits, lines, tests). Code identifiers go here and only here.>
```

- 450–650 words above "Under the hood".
- First person for decisions. People before systems.
- Corrections in section 8 override anything in the old case study.
- Nothing from section 9 appears anywhere.
- Status words must match the frontmatter: never call a staging or internal
  system "live in production".

## Step 6 — id.mdx

Same content in natural Indonesian, written from the English meaning, not
translated line by line (VOICE.md "Bahasa Indonesia"). Headings, exactly:
`## Masalahnya`, `## Yang saya bangun`, `## Hasilnya`, `## Langkah berikutnya`
(optional), `## Di balik layar`. Use "saya". Indonesian months in prose
(Mei, Agu, Okt, Des). Indonesian number formatting in prose (2.200, 13,7 ribu).

## Step 7 — Check

Run all of these. Fix what they flag; don't commit until they pass.

1. `npm run lint:voice -- <slug>` — must end with `1/1 projects clean`. A
   warning may stay only if fixing it would make the copy wrong; say why in
   the report.
2. `node -e "JSON.parse(require('fs').readFileSync('content/projects/<slug>/meta.json','utf8'))"`
3. `node scripts/check-assets.mjs` — image budgets.
4. By hand: every number in `meta.json`, `en.mdx` and `id.mdx` appears in your
   Step 2 list. Every date matches the timeframe. No section 9 item appears.

A full `npm run build` needs network access for fonts; run it if you can, and
say so if you couldn't.

## Step 8 — Commit

One project per commit. Stage only that project's three files:

```
git add content/projects/<slug>/meta.json content/projects/<slug>/en.mdx content/projects/<slug>/id.mdx
git commit -m "content(<slug>): take in portfolio context of <generated date>

<one or two lines: what changed — new project, new numbers, status change,
corrections applied>"
```

End the commit message with the attribution lines your session requires.
`PORTFOLIO_CONTEXT.md` is git-ignored; never force-add it. Don't push unless
the user asks.

## Step 9 — Report

For each project, tell the user:

- new or updated, and the new English tagline;
- numbers that changed from the previous version, and corrections applied;
- validator warnings and any lint warning you kept;
- open questions from section 9 (status you couldn't confirm, missing hero
  screenshot, anything you left out).

## Things you must not do

- Invent a number, date, user count, or roadmap item.
- Use a `target` or `effort` row as a site metric.
- Copy text from section 9, or any secret, anywhere.
- Change `order`, `featured` or `heroImage` of an existing project unasked.
- Touch other projects, components, or messages in the same commit.
- Mark the context taken in (`source`) if Step 7 failed.

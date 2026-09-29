---
name: portfolio-intake
description: Turn a project's PORTFOLIO_CONTEXT.md (schema portfolio-context/v2) into its case study on the AFM Studio site — meta.json, en.mdx and id.mdx — following VOICE.md. Use when the user runs /portfolio-intake, says a project's portfolio context was updated or exported, asks to add a new project to the portfolio, or asks to process pending contexts.
---

# Portfolio intake

You are updating the AFM Studio portfolio from a fact sheet. The fact sheet is
`content/projects/<slug>/PORTFOLIO_CONTEXT.md`, written in another repository
by the prompt in `docs/portfolio-intake/EXPORT_PROMPT.md`. Your output is three
files in the same folder: `meta.json`, `en.mdx`, `id.mdx`. Nothing else changes.

Your job is to be a careful editor, not a writer. Every sentence you publish
must be traceable to the fact sheet or to the current case study. When in
doubt, leave it out or STOP and ask. A shorter true case study is always
better than a fuller one with one invented detail.

Follow the steps in order. Do not skip checks. STOP means: stop, tell the user
exactly what you found, and wait.

## Arguments

- `/portfolio-intake <slug>` — one project.
- `/portfolio-intake` with no slug — run `node scripts/check-context.mjs --pending`
  and process every pending project, one at a time, one commit each. Finish
  and commit one project before reading the next.

## Step 1 — Validate the fact sheet

Run `node scripts/check-context.mjs <slug>`.

- Any **error**: STOP. Show the errors and say the context must be fixed and
  re-exported in the project's repo. Do not fix the fact sheet yourself,
  not even to reclassify a row; it's the other repo's source of truth.
- Warning "status is live but section 3 mentions staging": STOP and ask the
  user whether the project is in production.
- Other **warnings**: note them for the report and continue.

## Step 2 — Read, in this order

1. `VOICE.md` — all of it.
2. `content/projects/<slug>/PORTFOLIO_CONTEXT.md` — the facts.
3. The current `meta.json`, `en.mdx`, `id.mdx` for this slug, if they exist.
4. Reference shape and tone, all three files each: `content/projects/lantara/`
   for government work, `content/projects/pola-hujan/` for lab work. If the
   slug you're processing is one of these, use `content/projects/cubiq/`.

## Step 3 — Build the fact ledger (write it out, keep it for the report)

Before any prose, write a list with one line per fact you may use:

```
[ctx §5] 34 locations classified from satellite rainfall (scale)
[ctx fm] status live, launched null, timeframe 2026-08-10 → 2026-08-12
[ctx §8] README's "130+ tests" is stale → 1,595
[old]    access request durations 7, 30, 90 days or permanent
[ctx §9] DO NOT PUBLISH: internal mirror hostname
```

Sources:
- `ctx fm`, `ctx §1`…`§10` — the fact sheet. These win every conflict.
- `old` — a fact in the current case study that the fact sheet neither states
  nor contradicts. You may keep it; you may not change its wording's meaning.
- Nothing else. No inference, no general knowledge about the technology, no
  "probably".

Then list **conflicts**: every place the current case study disagrees with the
fact sheet (a number, a status, a date, a name). The fact sheet wins each one.
The same topic with a different number is a conflict even if the scopes might
differ (old copy "twelve open items", section 6 "five open decisions": use
five, drop twelve).

`[old]` facts may stay in the problem, what-I-built and under-the-hood
sections. They never go into "What I'd do next" (section 6 only) or into
status, dates or metrics (frontmatter and Step 5 only).

## Step 4 — Decide new or update

- **New project** (no `meta.json`): build every field from the mapping below.
- **Update**: edit, don't rewrite. Keep every existing sentence whose facts are
  still in the ledger. Change only what the fact sheet changes, add what it
  adds, remove what it contradicts. Keep `order`, `featured`, `heroImage` and
  extra `categoryTags` unless the user asked otherwise.
- STOP if the fact sheet's `track` differs from the project's current track.

## Step 5 — Metrics (the most common mistake — read twice)

A metric is something a non-engineer can picture: people, organisations,
units, documents, records, places, cities, sectors, drugs, languages, years of
data, time saved, errors caught.

Never a metric, whatever the fact sheet's `kind` column says:
- anything about the codebase: apps, modules, models, tables, endpoints,
  viewsets, routes, components, files, migrations, seed rows, lines, tests,
  commits, days of work;
- `target` rows (planned, designed-for);
- `effort` rows.

How to choose 3–4:
1. Candidates: fact-sheet rows of kind `impact` or `scale` that pass the rule
   above. `impact` first.
2. If fewer than 3: add existing site metrics that pass the rule and aren't
   contradicted by the fact sheet. Never drop a picturable existing metric in
   favour of a codebase one.
3. Still fewer than 2: STOP and tell the user the fact sheet has no
   user-facing figures; ask whether to publish without a metrics strip.
   Exactly 2: continue, and say so in the report.
4. `value` copied exactly. `label` lowercase, 3–8 words, no final full stop,
   same meaning as the source row, never repeats the value.

The same rule applies to prose: codebase counts appear only under
"Under the hood".

## Step 6 — meta.json mapping

| Field | Rule |
| --- | --- |
| `slug` | frontmatter `slug` (must equal the folder name) |
| `title` | fact sheet `title` |
| `tagline` | VOICE.md tagline formula, ≤ 18 words, no em-dash, no final full stop, no stack names. From section 1. Update: keep the old one unless it's contradicted. |
| `glance.for` | who uses it, ≤ 12 words, from section 2 |
| `glance.result` | the outcome in one line, ≤ 14 words, using the status words below. No codebase counts. |
| `skills` | 3–4 recruiter-searchable skills from sections 4 and 7. Not library names. Update: keep unless wrong. |
| `categoryTags` | contains `"Government"` iff `track` is `government`. New lab: `["Personal Project", "Web App"]`. New government: `["Government", "Web App"]`. Keep extra tags. |
| `problemShape` | fact sheet |
| `techStack` | fact sheet, same order |
| `status` | `live`, `staging`, `internal` → `"active"`; `private`, `unreleased` → `"private"` |
| `role` | fact sheet `role`, Title Case ("Solo Developer") |
| `timeframe` | same month → `"Aug 2026"`; same year → `"May – Jul 2026"`; across years → `"Dec 2025 – Feb 2026"`; ongoing → `"Jun 2025 – present"`. En dash with spaces, three-letter English months. |
| `liveUrl` | `live`/`internal` → `liveUrl`; `staging` → `stagingUrl`; `private`/`unreleased` → `null` |
| `liveIsStaging` | `true` only for `staging`; otherwise omit the key |
| `access` | fact sheet |
| `githubUrl` | fact sheet (`null` if private) |
| `heroImage` | update: keep. New: `/images/projects/<slug>/hero.webp` if it exists, else `/images/projects/<slug>/cover.svg`, and report that a screenshot is needed. |
| `order` | update: keep. New: highest existing `order` + 1. |
| `featured` | update: keep. New: `false`. |
| `metrics` | Step 5 |
| `id` | Indonesian `tagline`, `glance`, `skills`, `metrics` (same count, same values; values may use Indonesian number formatting) |
| `source` | `{ "schema": "portfolio-context/v2", "generated": "<frontmatter generated>" }` |

Key order: `slug, title, tagline, glance, skills, categoryTags, problemShape,
techStack, status, role, timeframe, liveUrl, liveIsStaging, access, githubUrl,
heroImage, order, featured, metrics, id, source`. Two-space indent, UTF-8 (no
`\u` escapes), trailing newline.

### Status words — use exactly these ideas, nothing stronger

| Frontmatter | English | Indonesian |
| --- | --- | --- |
| `live`, `access: public` | "is live" / "is live at <domain>" | "sudah live" |
| `live`, `access: registration` | "is live; anyone can register" | "sudah live; siapa pun bisa mendaftar" |
| `internal` or `access: internal` | "runs inside <org>; login required" | "berjalan di internal <org>; perlu login" |
| `staging` | "a public staging site is up" | "situs staging-nya sudah bisa diakses" |
| `private` / `unreleased` | "private" / "not released yet" | "privat" / "belum dirilis" |

- Say "in production" only for `live` or `internal`.
- Attach a date to going live ("live since …", "launched in …") only if
  `launched` is a date, and use that date. Never use the first commit date.
- The build period comes from `timeframe` ("built between July and September
  2026", or "since July 2026" for ongoing).

## Step 7 — en.mdx

```
# <title>

## The problem
<sections 1–2 (+ old): who has the problem, what it cost them, what existed before. 80–130 words.>

## What I built
### <a decision from section 4, as a plain sentence>
<what I chose, why, what it made possible. 50–100 words.>
(3–5 of these; section 4 decisions first, old ones only if still supported)

## Result
<status words, who uses it, scale (Step 5 figures only), what changed, when it was built. 60–120 words.>

## What I'd do next
<2–3 bullets from section 6 only. Omit the section if section 6 has none.>

## Under the hood
<section 7 bullets, section 5 effort rows (apps, models, endpoints, tests, lines, commits), code identifiers.>
```

- 450–650 words above "Under the hood".
- Apply every section 8 correction. Section 8 items are instructions: fix the
  wrong claim, add the missing fact.
- Nothing from section 9 appears anywhere, even paraphrased.
- Keep each fact's meaning exactly. Don't widen it with "each", "all",
  "every", "always", "verified", "fully", "in production" unless the source
  says so.

## Step 8 — id.mdx

Same content in natural Indonesian, written from the English meaning (VOICE.md
"Bahasa Indonesia"). Headings: `## Masalahnya`, `## Yang saya bangun`,
`## Hasilnya`, `## Langkah berikutnya` (optional), `## Di balik layar`. Use
"saya", Indonesian months in prose, Indonesian number formatting in prose.
The Indonesian must not contain a fact the English doesn't.

## Step 9 — Check

Run all of these. Fix what they flag. Don't commit until they pass.

1. `npm run lint:voice -- <slug>` — must end `1/1 projects clean`. Codebase
   count and metric warnings are never acceptable. Any other kept warning
   needs a reason in the report.
2. `node -e "JSON.parse(require('fs').readFileSync('content/projects/<slug>/meta.json','utf8'))"`
3. `node scripts/check-assets.mjs`
4. `node scripts/check-intake.mjs <slug>` — the machine half of the audit:
   unsourced numbers, next steps outside section 6, launch dates without
   `launched`, status words, unknown hostnames, the `source` marker. It must
   print ✓. Its stack warning means: add the technology to nothing, but say in
   the report which technology the prose names that the fact sheet doesn't.
   Do not argue with an error; change the copy.
5. Ledger audit, by hand, sentence by sentence through `en.mdx`, `meta.json`
   and `id.mdx`: each factual claim maps to a ledger line; no ledger `[ctx §9]`
   item appears; every status phrase matches the table in Step 6; every date
   matches `timeframe` or `launched`. Fix, then audit again.

`npm run build` needs network access for fonts; run it if you can, and say so
if you couldn't.

## Step 10 — Commit

One project per commit, only its three files:

```
git add content/projects/<slug>/meta.json content/projects/<slug>/en.mdx content/projects/<slug>/id.mdx
git commit -m "content(<slug>): take in portfolio context of <generated date>

<what changed, as facts: "metrics: X → Y", "status wording: staging → live",
"added section 8 correction: README test count">"
```

- Call something a "correction" only if it is in section 8.
- Don't describe a removed fact as "stale" or "wrong" unless section 8 says so;
  write "removed: <fact> (not in the fact sheet)".
- End with the attribution lines your session requires. Never force-add
  `PORTFOLIO_CONTEXT.md`. Don't push unless asked.

## Step 11 — Report

For each project: new or updated; the tagline; metrics before → after;
conflicts found and how the fact sheet resolved them; facts removed; section 9
items withheld (by category); validator and lint warnings; open questions.

## Never

- Invent a number, date, status, user count, name or roadmap item.
- Publish a codebase count, a `target` row or an `effort` row as a metric or
  in the visible story.
- Say "in production" or "live since" beyond what the frontmatter supports.
- Edit `PORTFOLIO_CONTEXT.md`, other projects, components or messages.
- Record `source` if Step 9 failed.

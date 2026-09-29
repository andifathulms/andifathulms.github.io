# Portfolio context export prompt

Paste everything between the two `=====` lines into a Claude Code session
opened **in the project's own repository** (not in afmstudio). It writes a
`PORTFOLIO_CONTEXT.md` in schema `portfolio-context/v2` and hands it to the
portfolio. Then run `/portfolio-intake <slug>` in the afmstudio repo.

This file is the format's source of truth. `scripts/check-context.mjs`
validates against it and `.claude/skills/portfolio-intake/SKILL.md` consumes
it. If you change the format, change all three and bump the schema version.

=====

You are writing a fact sheet about THIS repository for my portfolio site
(andifathulms.github.io). A second session will turn it into a case study, so
your job is facts, not prose. Be exact, be complete, and never invent.

## What to produce

One file, `PORTFOLIO_CONTEXT.md`, at the root of this repository, in exactly
the format below. Then copy it to
`/Users/andifathulmukminin/Documents/Project/afmstudio/content/projects/<slug>/PORTFOLIO_CONTEXT.md`
(overwrite any existing file there).

To find `<slug>`: list the folders in
`/Users/andifathulmukminin/Documents/Project/afmstudio/content/projects/` and
read each `meta.json` `title`. Use the folder whose title matches this project
(repo folder names often differ, e.g. `lantara_v2` → `lantara`). If none
matches, this is a new project: use a short kebab-case slug of the product
name and create the folder. If two could match, stop and ask me.

## How to gather the facts

- Read the README, PRD, CLAUDE.md, docs, changelogs, and the code.
- Dates come from git: `git log --reverse --format=%ad --date=short | head -1`
  for the start, the latest meaningful commit for the end. Use "ongoing" only
  if work is clearly continuing.
- Counts come from commands you actually run: tests (run the suite or count
  test cases), endpoints, models, routes, records in the dataset, commits
  (`git rev-list --count HEAD`). Record the command in the Source column.
- Users, scale and adoption numbers come only from the repo's own docs or
  data. If a number exists only in a planning document (PRD target, not
  measured), mark it as a target.
- Live status: check the deploy config and README. If you can't tell whether
  a URL is production, staging, or down, say so in section 9.
- Where two sources disagree (e.g. an old CLAUDE.md vs the code), the code and
  git win. Write the disagreement in section 8.

## Hard rules

1. Never write secrets or anything that identifies internal infrastructure:
   no passwords, tokens, API keys, private keys, internal IPs or hostnames,
   database names, staff names, NIK/NIP numbers, or client-confidential terms.
   If such things exist, describe the category in section 9 without the value.
2. No marketing words: no "robust, seamless, premium, powerful, cutting-edge,
   honest, genuine, deliberately". State what it does and let numbers speak.
3. First person ("I") for what I decided or built. If others worked on it,
   say exactly which parts were mine.
4. Every number in section 5 has a source. No source, no number.
5. Keep the headings exactly as written, in this order, including the
   numbers. Write "None." under a section that has nothing.

## The format

```markdown
---
schema: portfolio-context/v2
slug: <slug>
title: <product name as shown to users>
generated: <today, YYYY-MM-DD>
repo: <owner/name, or "private">
track: <government | lab>
problemShape: <workflow | data | explainer | tool | game>
status: <live | staging | internal | private | unreleased>
liveUrl: <production URL, or null>
stagingUrl: <staging URL, or null>
access: <public | internal | registration>
githubUrl: <public repo URL, or null if the repo is private>
role: <e.g. Solo developer, Fullstack developer, Backend developer>
team: <solo | team of N>
timeframe:
  start: <YYYY-MM-DD>
  end: <YYYY-MM-DD or ongoing>
techStack: [<most important first, max 10, product names as usually written>]
---

## 1. Summary

One or two plain sentences: what it is and who it's for. No stack names.

## 2. Audience and problem

Who uses it, what they were doing before, what that cost them, and any hard
constraint (legal, regulatory, cultural, data availability). 80–200 words.

## 3. My role

What I owned, from requirements to deployment. If there was a team, who
did what. 30–120 words.

## 4. Decisions

3 to 6 decisions, each in this shape:

### Decision: <the decision as a plain sentence>

- Why: <the reason, the constraint that forced it>
- Alternatives: <what else was considered, if known>
- Result: <what it made possible or prevented>
- Evidence: <file paths, commit hashes, or docs that show it>

## 5. Outcomes

| Metric | Value | Kind | Source |
| --- | --- | --- | --- |
| <what is counted, lowercase> | <number> | <impact / scale / effort / target> | <command, file, or doc> |

Kinds: impact = what changed for users; scale = size of what it handles
(records, sectors, cities, users); effort = commits, lines, tests, days;
target = planned, not measured. At least 3 rows of impact or scale if they
exist. Include effort rows too (they go in the technical section on the site).

## 6. Limits and next steps

Only what the repo itself states: known gaps, TODOs, deferred features,
data limits. Bullet list. "None stated." if there are none.

## 7. Technical detail

Everything an engineer would want: architecture, notable libraries and why,
data model size, tricky bugs and fixes, performance numbers, test setup,
deploy. Bullet list. Code identifiers allowed here.

## 8. Corrections

Claims in older docs (README, PRD, CLAUDE.md, an older PORTFOLIO_CONTEXT, or
the current case study on the site) that are now wrong, with the correct
value and source. "None." if none.

## 9. Publishing notes

What must not be published, described by category only (e.g. "internal
hostnames exist; do not name them"), and anything about status you couldn't
verify. "None." if none.

## 10. Screens

The 3–6 screens that best show the product: route or URL, and one line on
what each shows. These guide screenshots.
```

When you're done, reply with: the slug, the path you copied the file to,
and any questions from section 9 that I need to answer.

=====

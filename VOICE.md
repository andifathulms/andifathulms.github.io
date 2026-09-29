# VOICE.md — how AFM Studio sounds

Read this before writing or editing any copy on the site: case studies
(`content/projects/*/en.mdx`, `id.mdx`), project manifests (`meta.json`), and UI
strings (`messages/*.json`). `DESIGN.md` covers how the site looks. This file
covers how it reads.

`npm run lint:voice` checks most of these rules mechanically. It warns and does
not block the build. Treat every warning as a question: "is this the one
exception, or is it a habit?"

## Who is reading

In order of priority:

1. **Recruiters and hiring managers.** They give a case study about a minute.
   They want to know what the thing does, who uses it, what Fathul decided, and
   whether it worked. Most of them are not engineers.
2. **Freelance clients.** Same questions, plus "can he solve my problem".
3. **Engineers** evaluating depth. They will open "Under the hood". Everything
   technical lives there, so nothing is lost for them.

## The voice in one line

Write like you're explaining the project to a sharp engineer from another team,
over coffee, with the app open between you.

That person is smart and busy. They don't know this codebase, and they don't
need to be convinced you are careful. Show them the work and let them judge it.

| Axis | Target |
| --- | --- |
| Formal ↔ conversational | A little past the middle, toward conversational |
| Defensive ↔ confident | Confident. State limits once, calmly, at the end |
| Code-first ↔ people-first | People first. Code only in "Under the hood" |
| Dense ↔ airy | Airy. One idea per sentence |

## The eight rules

### 1. Say "I" when you made the call

Decisions get a subject. Facts about the system can stay plain.

- ✕ The design pushes everything into management commands.
- ✓ I precompute the heavy analytics in background jobs.

Don't overdo it. "I" belongs on decisions, not on every sentence.

### 2. Start with the person, then the system

Every problem section opens with who has the problem and what it costs them.
The first paragraph of a case study never contains a library name.

- ✕ The TwistyPlayer renderer must be instantiated as a DOM element.
- ✓ Most serious speedcubers still time their solves in csTimer.

### 3. Say what it is, not what it isn't

Drop the "not X, but Y" shape and its relatives: "rather than", "instead of",
"not just", "X, not Y" headings. Each one invents a weaker alternative to beat.
Allow at most one real contrast per case study, where it carries the point.

- ✕ A build-time compliance gate, not a policy document
- ✓ The build fails if a drawing is missing its SPESIMEN mark

### 4. Let the evidence do the grading

Remove words that rate the work instead of describing it: *honest, honestly,
genuine, genuinely, real* (as an intensifier), *deliberately, crucially, truly,
the hardest, blunt, premium, beautiful, rich, seamless, robust*. If a claim is
true, the fact behind it says so. If it needs the adjective, it isn't proven.

- ✕ Honest about what doesn't work
- ✓ What it can't do yet

### 5. Count what users feel

Use numbers a reader can picture: people served, records, sectors, cities,
drugs, years of data, response times. Commit counts and lines of code are
effort, not outcome. They may appear in "Under the hood" only, never in
`metrics`, the tagline, or the visible sections.

- ✕ 241 commits over ~3 weeks
- ✓ ~2,200 business permit codes, set up without code

### 6. Layer the depth

Three layers, in this order:

1. **Plain summary** — the tagline and the at-a-glance panel (`meta.json`).
2. **Decisions** — the visible sections. Plain words, no backticks.
3. **Under the hood** — optional, collapsed by default. Function names, model
   names, commands, library quirks, commit and line counts all live here.

### 7. Short sentences, one dash per paragraph

- Aim for an average under 22 words per sentence.
- At most one em-dash (—) per paragraph. Use a full stop or a comma instead.
- Headings are plain sentences that state a decision. No colon reveals, no
  "X, not Y" headings, no puns.
- No rhetorical questions in headings.

### 8. Every number matches `meta.json`

Dates, durations and counts are checked against the project's `meta.json` and
source files (`PORTFOLIO_CONTEXT.md`, `PRD.md`). If the prose and the manifest
disagree, the prose is wrong. Never round up, never invent a number, never
state a duration the timeframe doesn't support. (Cubiq once said "six months"
for an 11-week build.)

## Case study shape

Target 450–650 words across the visible sections (a three-minute read).
"Under the hood" doesn't count toward the budget.

| Section (EN) | Section (ID) | Length | What goes in it |
| --- | --- | --- | --- |
| `## The problem` | `## Masalahnya` | 80–130 words | Who has the problem, what it costs them, what existed before. No code, no stack names. |
| `## What I built` | `## Yang saya bangun` | 3–5 × `###`, 50–100 words each | Each `###` heading is a decision in plain words. Each section says what I chose, why, and what it made possible. |
| `## Result` | `## Hasilnya` | 60–120 words | Status (live, staging, internal), who uses it, scale, what changed. Numbers from `meta.json` only. |
| `## What I'd do next` | `## Langkah berikutnya` | 2–3 bullets, optional | Only when the source names a limit or next step. Never invent a roadmap. |
| `## Under the hood` | `## Di balik layar` | Any length, optional | Bullet list of technical detail. Collapsed on the page. |

The page renders the title, so the file opens with `# Title` and that line is
stripped. Use these exact section headings. The case study page finds
"Under the hood" / "Di balik layar" by name to collapse it.

## `meta.json` copy fields

```jsonc
{
  "tagline": "…",            // EN, ≤ 18 words, see formula below
  "glance": {
    "for": "…",              // EN, who uses it, ≤ 12 words
    "result": "…"            // EN, the outcome in one line, ≤ 14 words
  },
  "skills": ["…", "…", "…"], // EN, 3–4 skills a recruiter would search for
  "metrics": [               // EN, 3–4 items, impact first, no commits/LOC
    { "value": "31", "label": "regulated permit sectors" }
  ],
  "id": {                    // Indonesian overrides for the same fields
    "tagline": "…",
    "glance": { "for": "…", "result": "…" },
    "skills": ["…"],
    "metrics": [{ "value": "31", "label": "sektor perizinan" }]
  }
}
```

- Metric labels are lowercase sentence fragments, 3–8 words, no trailing full
  stop. The value carries the number; the label never repeats it.
- Skills are nouns a recruiter would type into a search: "Workflow engines",
  "Role-based access control", "Geospatial data", "Offline-first PWAs". Not
  library names; those are already in `techStack`.

### Tagline formula

**[what it is] + [for whom / what it lets you do] + [one fact only this project
has]**. At most 18 words, no stack names, no em-dash, no full stop at the end.

- ✕ Indonesia doesn't have one rainy season — it has three rainfall patterns,
  and this atlas derives them from satellite data instead of copying the
  official map
- ✓ An atlas of Indonesia's three rainfall patterns, computed from raw satellite
  data so anyone can check it

The Daily Taqwa tagline is the model: "Tamper-resistant prayer attendance
system for ~2,000 OIKN government employees at Masjid Negara IKN". It names
what, who, how many, where, and the one property that matters.

## Bahasa Indonesia

Write the Indonesian version in Indonesian. Don't translate the English
sentence by sentence.

- Use "saya", not "kami" (it's one person) and not "penulis".
- Keep the English terms Indonesian developers actually say at work:
  *deploy, hardcode, workflow, dashboard, frontend, backend, staging, commit*.
  Italicise them only on first use if they might confuse a non-developer.
- Never calque an English idiom. "Dikodekan secara keras" is not Indonesian;
  "di-hardcode" is.
- Same rules as English: no "bukan sekadar", no "alih-alih" habit (one per
  case study at most), no "benar-benar", "secara jujur", "sungguh".
- Formal but warm, the register of a good technical blog post, not a
  government letter. Avoid "adapun", "yang mana", "dalam rangka".
- Numbers use Indonesian formatting in prose: 2.200, 13,7 ribu, 30,5 ribu.
  Values in `metrics` may keep compact forms (~2.200, 14/34).

## Site-level copy (`messages/*.json`)

- The hero says who Fathul is before what he offers.
- Primary calls to action work for both recruiters and clients: "Contact",
  "View CV", "See the work". Avoid "Start a project" as the only option.
- One plain sentence about how the work is built, used on About and in How I
  work: "I write a spec for every project, then build with Claude Code as my
  pair. The decisions, the review and the result are mine." Don't repeat it as
  a badge on every project.

## Voice pass checklist

Run this for each project, one project per commit:

1. Read `PORTFOLIO_CONTEXT.md`, `PRD.md`, `meta.json` and the current
   `en.mdx` / `id.mdx`. Note every number and date.
2. Rewrite `en.mdx` in the case study shape. Move all code-level detail to
   "Under the hood".
3. Rewrite `meta.json` copy fields: tagline, glance, skills, metrics.
4. Write `id.mdx` and the `id` block in Indonesian from the English meaning.
5. Run `npm run lint:voice -- <slug>` and fix what it flags, or keep the
   exception on purpose.
6. Check every number against step 1 by hand. The linter can't do this part.

# Portfolio intake

How a project's facts get from its own repository onto this site.

```
project repo                           afmstudio
────────────                           ─────────
paste EXPORT_PROMPT.md  ──writes──▶  content/projects/<slug>/PORTFOLIO_CONTEXT.md
                                              │
                                  npm run check:context -- <slug>   (validates, blocks secrets)
                                              │
                                  /portfolio-intake <slug>          (.claude/skills/portfolio-intake)
                                              │
                                  meta.json · en.mdx · id.mdx        (VOICE.md rules, lint:voice)
                                              │
                                  one commit per project
```

| File | Role |
| --- | --- |
| `EXPORT_PROMPT.md` | The prompt to paste in each project repo. Also the spec of schema `portfolio-context/v2`. |
| `EXAMPLE.md` | A valid v2 context (Pola Hujan), for reference and for testing the validator. |
| `../../scripts/check-context.mjs` | Validates a context: frontmatter, sections, outcome sources, secrets. `--pending` lists contexts not yet taken in. |
| `../../scripts/check-intake.mjs` | Cross-checks the written case study against the fact sheet: unsourced numbers, next steps outside section 6, launch dates, status words, hostnames. |
| `../../.claude/skills/portfolio-intake/SKILL.md` | The receptor: step-by-step mapping from context to site files, checks, and commit. |
| `../../VOICE.md` | How the copy reads. |

## Commands

- `npm run check:context -- <slug>` — validate one context.
- `node scripts/check-context.mjs --pending` — list contexts newer than their last intake.
- `node scripts/check-context.mjs --file <path>` — validate any file.
- `npm run check:intake -- <slug>` — cross-check the case study against its fact sheet (run before committing an intake).
- In Claude Code: `/portfolio-intake <slug>`, or `/portfolio-intake` for all pending.

## Changing the format

Edit `EXPORT_PROMPT.md`, `check-context.mjs` and the skill together, and bump
the schema version in all three. Old contexts then fail validation with a
"re-export" message instead of being misread.

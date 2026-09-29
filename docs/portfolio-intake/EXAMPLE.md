---
schema: portfolio-context/v2
slug: pola-hujan
title: Pola Hujan
generated: 2026-08-20
repo: andifathulms/pola-hujan
track: lab
problemShape: explainer
status: live
liveUrl: https://andifathulms.github.io/pola-hujan/
stagingUrl: null
access: public
githubUrl: https://github.com/andifathulms/pola-hujan
role: Solo developer
team: solo
timeframe:
  start: 2026-08-10
  end: 2026-08-12
launched: null
techStack: [Next.js, React, TypeScript, Tailwind CSS, Zod, Vitest, GitHub Actions, GitHub Pages]
---

## 1. Summary

An atlas of Indonesia's three rainfall patterns for general Indonesian readers, computed from satellite rainfall instead of copied from the official zone map.

## 2. Audience and problem

Indonesians learn that the country has two seasons, which is true for Java and wrong for much of the rest. Ambon's wet season falls in Java's dry months, and parts of the equator have two wet peaks a year. BMKG maps 699 season zones in three families (Monsunal, Ekuatorial, Lokal), but that knowledge sits in PDF bulletins and expert judgement. The audience is curious general readers. Hard constraint: it must describe long-term climate and say clearly that it is not a forecast or a planting calendar.

## 3. My role

Solo: research, data pipeline, classifier, site, tests and deployment.

## 4. Decisions

### Decision: I computed the classification from raw satellite data

- Why: a traced copy of BMKG's map can't be checked; a computed one can.
- Alternatives: digitising BMKG's zone polygons.
- Result: each place is classified by harmonic analysis of its twelve-month cycle.
- Evidence: lib/classify.ts, docs/method.md

### Decision: I never tune thresholds toward agreement with BMKG

- Why: tuning until the maps match turns an analysis into an imitation.
- Alternatives: adjusting cutoffs per region.
- Result: Medan and Palu disagree and are shown as findings; a layer marks every disagreement.
- Evidence: config/thresholds.ts (cites Aldrian & Susanto 2003)

### Decision: I proved the classifier on synthetic data first

- Why: correctness should not depend on eyeballing a map.
- Alternatives: validating only against BMKG labels.
- Result: a generator builds cycles from known parameters; the classifier must recover them.
- Evidence: tests/synthetic.test.ts

## 5. Outcomes

| Metric | Value | Kind | Source |
| --- | --- | --- | --- |
| locations classified from satellite rainfall | 34 | scale | data/locations.json |
| BMKG labels checked against its own bulletin | 14/34 | impact | docs/verification.md |
| years of rainfall records (2006–2015) | 10 | scale | pipeline/fetch.ts |
| network calls at runtime | 0 | impact | next.config.ts (static export) |
| tests | 54 | effort | npm test |
| commits | 64 | effort | git rev-list --count HEAD |

## 6. Limits and next steps

- 20 of 34 BMKG labels are still estimates.
- English version not built; the live site is Indonesian only.
- The regional CHIRPS archive stops in October 2016, so this is a 10-year record, not the 30-year standard.

## 7. Technical detail

- Hand-written decoders for CHIRPS BIL rasters and tar archives; no GDAL.
- Download cost is dominated by 120 monthly rasters, so coverage grew from 15 to 34 points almost for free.
- Everything runs at build time; static export on GitHub Pages.

## 8. Corrections

None.

## 9. Publishing notes

None.

## 10. Screens

- / — the regime atlas map
- /bandingkan — Jakarta versus Ambon comparison
- /metode — method and transparency page
- /penjelasan — interactive harmonic explainer with sliders

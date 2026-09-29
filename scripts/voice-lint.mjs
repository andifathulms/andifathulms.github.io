#!/usr/bin/env node
/**
 * Checks case study copy against VOICE.md.
 *
 *   node scripts/voice-lint.mjs              every project, full report
 *   node scripts/voice-lint.mjs cubiq lantara  only those projects
 *   node scripts/voice-lint.mjs --summary    one line per project (prebuild)
 *   node scripts/voice-lint.mjs --strict     exit 1 on any warning
 *
 * Warn-only by default: a voice rule has legitimate exceptions, and a build
 * that fails over an em-dash would get the linter deleted. What it can't check
 * — whether a number matches the source material — stays a human step.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PROJECTS = join(ROOT, 'content/projects');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const summary = args.includes('--summary');
const only = args.filter((a) => !a.startsWith('--'));

const HEADINGS = {
  en: {
    required: ['The problem', 'What I built', 'Result'],
    optional: ["What I'd do next"],
    hood: 'Under the hood',
  },
  id: {
    required: ['Masalahnya', 'Yang saya bangun', 'Hasilnya'],
    optional: ['Langkah berikutnya'],
    hood: 'Di balik layar',
  },
};

// Words that grade the work instead of describing it (VOICE.md rule 4), plus
// the contrast habits of rule 3. `max` is how many are tolerated per file.
const BANNED = {
  en: [
    { re: /\bhonest(ly)?\b/gi, max: 0, why: 'self-grading' },
    { re: /\bgenuine(ly)?\b/gi, max: 0, why: 'self-grading' },
    { re: /\bdeliberate(ly)?\b/gi, max: 0, why: 'self-grading' },
    { re: /\bcrucial(ly)?\b/gi, max: 0, why: 'self-grading' },
    { re: /\btruly\b/gi, max: 0, why: 'self-grading' },
    { re: /\bthe hardest\b/gi, max: 0, why: 'self-grading' },
    { re: /\b(premium|seamless|robust|beautiful)\b/gi, max: 0, why: 'adjective doing a fact\'s job' },
    { re: /\ba real\b|\breal-world\b/gi, max: 0, why: '"real" as an intensifier' },
    { re: /\bnot just\b|\bnot merely\b/gi, max: 0, why: 'not-X-but-Y' },
    { re: /\brather than\b/gi, max: 1, why: 'not-X-but-Y' },
    { re: /\binstead of\b/gi, max: 1, why: 'not-X-but-Y' },
    // Counted commits and lines are effort metrics. The bare word is fine —
    // the Git rebase simulator is about commits.
    { re: /~?\d[\d,.]*\+?\s+commits?\b|\blines of (code|python|typescript|ts)\b|~?\d[\d,.]*k?\s+lines\b/gi, max: 0, why: 'effort metric in visible copy' },
  ],
  id: [
    { re: /\bsecara jujur\b|\bjujur\b/gi, max: 0, why: 'self-grading' },
    { re: /\bbenar-benar\b|\bsungguh\b/gi, max: 0, why: 'self-grading' },
    { re: /\bsengaja\b/gi, max: 0, why: 'self-grading' },
    { re: /\bbukan sekadar\b|\bbukan hanya\b/gi, max: 0, why: 'not-X-but-Y' },
    { re: /\balih-alih\b/gi, max: 1, why: 'not-X-but-Y' },
    { re: /\bdikodekan secara keras\b/gi, max: 0, why: 'calque — write "di-hardcode"' },
    { re: /\b(adapun|yang mana|dalam rangka)\b/gi, max: 0, why: 'bureaucratic register' },
    { re: /~?\d[\d.,]*\+?\s+commit\b|\bbaris kode\b/gi, max: 0, why: 'effort metric in visible copy' },
  ],
};

const BUDGET = { min: 350, max: 700, sentence: 22 };

/** Split MDX into its visible part and the "Under the hood" part. */
function splitHood(mdx, locale) {
  const marker = new RegExp(`^##\\s+${HEADINGS[locale].hood}\\s*$`, 'm');
  const m = marker.exec(mdx);
  return m ? [mdx.slice(0, m.index), mdx.slice(m.index)] : [mdx, ''];
}

function stripFences(text) {
  return text.replace(/```[\s\S]*?```/g, '');
}

function prose(text) {
  return stripFences(text)
    .split('\n')
    .filter((l) => !/^#/.test(l.trim()))
    .join('\n');
}

function words(text) {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

function sentences(text) {
  return prose(text)
    .replace(/^\s*[-*]\s+/gm, '')
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => words(s) > 2);
}

function lintMdx(slug, locale, warn) {
  const file = join(PROJECTS, slug, `${locale}.mdx`);
  if (!existsSync(file)) return warn(`${locale}.mdx missing`);
  const raw = readFileSync(file, 'utf8');
  const [visible] = splitHood(raw, locale);
  const h2 = [...raw.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1]);

  for (const h of HEADINGS[locale].required) {
    if (!h2.includes(h)) warn(`${locale}: missing "## ${h}"`);
  }
  const known = [...HEADINGS[locale].required, ...HEADINGS[locale].optional, HEADINGS[locale].hood];
  for (const h of h2) {
    if (!known.includes(h)) warn(`${locale}: unexpected section "## ${h}"`);
  }

  const n = words(prose(visible));
  if (n < BUDGET.min || n > BUDGET.max) {
    warn(`${locale}: ${n} visible words (target ${BUDGET.min}–${BUDGET.max})`);
  }

  const s = sentences(visible);
  const avg = s.length ? Math.round(s.reduce((a, x) => a + words(x), 0) / s.length) : 0;
  if (avg > BUDGET.sentence) warn(`${locale}: ${avg} words per sentence on average (≤ ${BUDGET.sentence})`);
  const long = s.filter((x) => words(x) > 38);
  if (long.length) warn(`${locale}: ${long.length} sentence(s) over 38 words — "${long[0].slice(0, 60)}…"`);

  const paragraphs = prose(visible).split(/\n{2,}/);
  const dashy = paragraphs.filter((p) => (p.match(/—/g) || []).length > 1).length;
  if (dashy) warn(`${locale}: ${dashy} paragraph(s) with more than one em-dash`);

  const headingsVisible = [...visible.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1]);
  const xNotY = headingsVisible.filter((h) => /,\s*(not|bukan)\s/i.test(h) || /:\s/.test(h));
  if (xNotY.length) warn(`${locale}: heading reads as a reveal — "${xNotY[0]}"`);

  const code = (stripFences(visible).match(/`[^`]+`/g) || []).length;
  if (code) warn(`${locale}: ${code} inline code span(s) above "${HEADINGS[locale].hood}"`);

  for (const { re, max, why } of BANNED[locale]) {
    const hits = prose(visible).match(re) || [];
    if (hits.length > max) warn(`${locale}: "${hits[0].toLowerCase()}" ×${hits.length} (${why})`);
  }
}

function lintMeta(slug, warn) {
  const file = join(PROJECTS, slug, 'meta.json');
  if (!existsSync(file)) return warn('meta.json missing');
  const meta = JSON.parse(readFileSync(file, 'utf8'));
  if (meta.status === 'placeholder') return 'skip';

  const tagline = (label, t) => {
    if (!t) return warn(`${label} missing`);
    if (words(t) > 18) warn(`${label}: ${words(t)} words (≤ 18)`);
    if (/—/.test(t)) warn(`${label}: contains an em-dash`);
    if (/\.$/.test(t.trim())) warn(`${label}: ends with a full stop`);
  };
  const block = (label, m) => {
    if (!m?.glance?.for || !m?.glance?.result) warn(`${label}glance.for / glance.result missing`);
    if (!Array.isArray(m?.skills) || m.skills.length < 3 || m.skills.length > 4) {
      warn(`${label}skills: need 3–4`);
    }
    for (const x of m?.metrics ?? []) {
      if (/commit|lines? of|baris kode|\bLOC\b/i.test(x.label)) warn(`${label}metric "${x.label}" is an effort metric`);
    }
  };

  tagline('tagline', meta.tagline);
  block('', meta);
  if (!meta.id) {
    warn('id block missing (Indonesian tagline, glance, skills, metrics)');
  } else {
    tagline('id.tagline', meta.id.tagline);
    block('id.', meta.id);
    if ((meta.id.metrics?.length ?? 0) !== (meta.metrics?.length ?? 0)) {
      warn('id.metrics count differs from metrics');
    }
  }
}

const slugs = readdirSync(PROJECTS)
  .filter((f) => statSync(join(PROJECTS, f)).isDirectory() && !f.startsWith('_'))
  .filter((s) => only.length === 0 || only.includes(s))
  .sort();

let total = 0;
let clean = 0;
for (const slug of slugs) {
  const warnings = [];
  const warn = (msg) => warnings.push(msg);
  if (lintMeta(slug, warn) === 'skip') continue;
  lintMdx(slug, 'en', warn);
  lintMdx(slug, 'id', warn);
  total += warnings.length;
  if (warnings.length === 0) clean++;

  if (summary) {
    if (warnings.length) console.log(`  ${slug.padEnd(28)} ${warnings.length} warning(s)`);
  } else if (warnings.length) {
    console.log(`\n${slug}`);
    for (const w of warnings) console.log(`  · ${w}`);
  } else {
    console.log(`\n${slug}  ✓`);
  }
}

console.log(
  `\nvoice-lint: ${clean}/${slugs.length} projects clean, ${total} warning(s). See VOICE.md.`
);
process.exit(strict && total > 0 ? 1 : 0);

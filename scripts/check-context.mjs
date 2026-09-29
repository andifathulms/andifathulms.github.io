#!/usr/bin/env node
/**
 * Validates PORTFOLIO_CONTEXT.md files against schema portfolio-context/v2
 * (docs/portfolio-intake/EXPORT_PROMPT.md is the spec).
 *
 *   node scripts/check-context.mjs <slug> [<slug> …]   validate those projects
 *   node scripts/check-context.mjs --file <path>        validate one file anywhere
 *   node scripts/check-context.mjs --pending            list contexts not yet taken in
 *
 * Exit 1 on any error, so the intake skill can stop before writing copy from
 * a malformed or unsafe fact sheet. Warnings don't fail.
 *
 * "Pending" means a v2 context whose `generated` date differs from the
 * `source.generated` recorded in that project's meta.json, or a v2 context
 * with no meta.json at all (a new project).
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = new URL('..', import.meta.url).pathname;
const PROJECTS = join(ROOT, 'content/projects');
const SCHEMA = 'portfolio-context/v2';

const SECTIONS = [
  '1. Summary',
  '2. Audience and problem',
  '3. My role',
  '4. Decisions',
  '5. Outcomes',
  '6. Limits and next steps',
  '7. Technical detail',
  '8. Corrections',
  '9. Publishing notes',
  '10. Screens',
];

const ENUMS = {
  track: ['government', 'lab'],
  problemShape: ['workflow', 'data', 'explainer', 'tool', 'game'],
  status: ['live', 'staging', 'internal', 'private', 'unreleased'],
  access: ['public', 'internal', 'registration'],
};
const KINDS = ['impact', 'scale', 'effort', 'target'];

// Counts of the codebase are effort, never scale or impact (EXPORT_PROMPT,
// "Kinds, strictly"). A recruiter can't picture "45 models".
export const CODE_TERMS =
  /\b(django apps?|backend apps?|apps|modules?|(?:data|database|django|concrete) models?|tables?|endpoints?|viewsets?|routes?|route files|components?|files|migrations?|seed(ed)? rows|masterdata rows|lines|loc|tests?|test functions|commits?|days)\b/i;

// Secrets and internal identifiers. Errors: these must never reach the site's
// source tree, even in a git-ignored file that a later session might quote.
const SECRETS = [
  [/\b(password|passwd|pwd)\s*[:=]\s*\S+/i, 'a password'],
  [/\b(secret|api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*\S+/i, 'a secret or key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'a private key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'an AWS access key'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/, 'a GitHub token'],
  [/\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, 'an internal IP address'],
  [/\b192\.168\.\d{1,3}\.\d{1,3}\b/, 'an internal IP address'],
  [/\b172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b/, 'an internal IP address'],
];
// Worth a human look, but legitimate in some projects.
const SUSPICIOUS = [
  [/\b\d{16}\b/, 'a 16-digit number (NIK?)'],
  [/\b\d{18}\b/, 'an 18-digit number (NIP?)'],
  [/\b(robust|seamless|premium|cutting-edge|powerful|genuinely|honestly|deliberately)\b/i, 'a marketing or self-grading word'],
];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const asDate = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ''));

export function checkContext(file, expectedSlug) {
  const errors = [];
  const warnings = [];
  if (!existsSync(file)) return { errors: [`file not found: ${file}`], warnings, data: null };

  const raw = readFileSync(file, 'utf8');
  let parsed;
  try {
    parsed = matter(raw);
  } catch (e) {
    return { errors: [`frontmatter is not valid YAML: ${e.message}`], warnings, data: null };
  }
  const fm = parsed.data;
  const body = parsed.content;

  if (fm.schema !== SCHEMA) {
    errors.push(`schema is "${fm.schema ?? 'missing'}", expected "${SCHEMA}" (older contexts need re-export)`);
    return { errors, warnings, data: fm };
  }

  for (const key of ['slug', 'title', 'generated', 'repo', 'track', 'problemShape', 'status', 'access', 'role', 'team', 'timeframe', 'techStack']) {
    if (fm[key] === undefined || fm[key] === '') errors.push(`frontmatter: "${key}" is missing`);
  }
  for (const [key, allowed] of Object.entries(ENUMS)) {
    if (fm[key] !== undefined && !allowed.includes(fm[key])) {
      errors.push(`frontmatter: ${key} "${fm[key]}" is not one of ${allowed.join(' | ')}`);
    }
  }
  if (fm.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.slug)) errors.push(`frontmatter: slug "${fm.slug}" is not kebab-case`);
  if (expectedSlug && fm.slug && fm.slug !== expectedSlug) {
    errors.push(`frontmatter: slug "${fm.slug}" doesn't match folder "${expectedSlug}"`);
  }
  if (fm.generated && !DATE.test(asDate(fm.generated))) errors.push('frontmatter: generated must be YYYY-MM-DD');

  const start = asDate(fm.timeframe?.start);
  const end = asDate(fm.timeframe?.end);
  if (!DATE.test(start)) errors.push('frontmatter: timeframe.start must be YYYY-MM-DD');
  if (end !== 'ongoing' && !DATE.test(end)) errors.push('frontmatter: timeframe.end must be YYYY-MM-DD or "ongoing"');
  if (DATE.test(start) && DATE.test(end) && end < start) errors.push('frontmatter: timeframe.end is before timeframe.start');

  if (!Array.isArray(fm.techStack) || fm.techStack.length === 0) errors.push('frontmatter: techStack must be a non-empty list');
  else if (fm.techStack.length > 10) warnings.push(`frontmatter: techStack has ${fm.techStack.length} items (max 10)`);

  const url = (v) => v === null || v === undefined || /^https?:\/\//.test(String(v));
  for (const key of ['liveUrl', 'stagingUrl', 'githubUrl']) {
    if (!url(fm[key])) errors.push(`frontmatter: ${key} must be a URL or null`);
  }
  if (['live', 'internal'].includes(fm.status) && !fm.liveUrl) errors.push(`frontmatter: status "${fm.status}" needs a liveUrl`);
  if (fm.status === 'staging' && !fm.stagingUrl) errors.push('frontmatter: status "staging" needs a stagingUrl');
  if (['private', 'unreleased'].includes(fm.status) && fm.liveUrl) {
    warnings.push(`frontmatter: status "${fm.status}" but liveUrl is set; the site will not link it`);
  }
  if (fm.status === 'internal' && fm.access === 'public') warnings.push('frontmatter: status "internal" with access "public" — check which is right');
  if (fm.launched !== undefined && fm.launched !== null && !DATE.test(asDate(fm.launched))) {
    errors.push('frontmatter: launched must be YYYY-MM-DD or null');
  }
  if (fm.launched === undefined) warnings.push('frontmatter: "launched" is missing (use null if unknown)');

  // Sections, in order.
  const headings = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1]);
  let cursor = -1;
  for (const title of SECTIONS) {
    const at = headings.indexOf(title);
    if (at === -1) errors.push(`section "## ${title}" is missing`);
    else if (at < cursor) errors.push(`section "## ${title}" is out of order`);
    else cursor = at;
  }

  const section = (title) => {
    const re = new RegExp(`^##\\s+${title.replace('.', '\\.')}\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'm');
    return (re.exec(body)?.[1] ?? '').trim();
  };

  const decisions = (section('4. Decisions').match(/^###\s+Decision:/gm) ?? []).length;
  if (decisions < 3 || decisions > 6) errors.push(`section 4 has ${decisions} "### Decision:" entries (need 3–6)`);

  const rows = section('5. Outcomes')
    .split('\n')
    .filter((l) => /^\|/.test(l.trim()) && !/^\|\s*-/.test(l.trim()) && !/^\|\s*Metric\s*\|/i.test(l.trim()))
    .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
  if (rows.length === 0) errors.push('section 5 has no outcome rows');
  rows.forEach((cells, i) => {
    const [metric, value, kind, source] = cells;
    if (cells.length < 4) return errors.push(`section 5 row ${i + 1} needs 4 columns`);
    if (!metric || !value) errors.push(`section 5 row ${i + 1} is missing a metric or value`);
    if (!KINDS.includes((kind ?? '').toLowerCase())) errors.push(`section 5 row ${i + 1}: kind "${kind}" is not one of ${KINDS.join(' | ')}`);
    if (!source || /^(-|n\/a|none|unknown)$/i.test(source)) errors.push(`section 5 row ${i + 1} ("${metric}") has no source`);
    if (['impact', 'scale'].includes((kind ?? '').toLowerCase()) && CODE_TERMS.test(metric ?? '')) {
      errors.push(`section 5 row ${i + 1} ("${metric}") counts the codebase; its kind must be "effort", not "${kind}"`);
    }
  });
  const impact = rows.filter(([, , k]) => ['impact', 'scale'].includes((k ?? '').toLowerCase())).length;
  if (rows.length && impact < 2) warnings.push(`section 5 has ${impact} impact/scale rows; the case study needs 3–4 metrics`);

  if (section('1. Summary').length === 0) errors.push('section 1 is empty');
  if (fm.status === 'live' && /\bstaging\b/i.test(section('3. My role'))) {
    warnings.push('status is "live" but section 3 mentions staging — the intake will stop until this is confirmed');
  }
  if (section('2. Audience and problem').split(/\s+/).length < 40) warnings.push('section 2 is very short (< 40 words)');

  for (const [re, what] of SECRETS) {
    const m = re.exec(raw);
    if (m) errors.push(`contains ${what}: "${m[0].slice(0, 40)}" — remove it; describe the category in section 9`);
  }
  for (const [re, what] of SUSPICIOUS) {
    const m = re.exec(raw);
    if (m) warnings.push(`contains ${what}: "${m[0].slice(0, 40)}"`);
  }

  return { errors, warnings, data: fm };
}

function slugs() {
  return readdirSync(PROJECTS)
    .filter((f) => statSync(join(PROJECTS, f)).isDirectory() && !f.startsWith('_'))
    .sort();
}

function report(label, { errors, warnings }) {
  const mark = errors.length ? '✕' : '✓';
  console.log(`\n${label}  ${mark}`);
  for (const e of errors) console.log(`  error · ${e}`);
  for (const w of warnings) console.log(`  warn  · ${w}`);
  return errors.length;
}

const args = process.argv.slice(2);

if (args[0] === '--pending') {
  const pending = [];
  for (const slug of slugs()) {
    const file = join(PROJECTS, slug, 'PORTFOLIO_CONTEXT.md');
    if (!existsSync(file)) continue;
    let fm;
    try {
      fm = matter(readFileSync(file, 'utf8')).data;
    } catch {
      pending.push(`${slug}  (frontmatter unreadable)`);
      continue;
    }
    if (fm.schema !== SCHEMA) continue;
    const metaFile = join(PROJECTS, slug, 'meta.json');
    if (!existsSync(metaFile)) {
      pending.push(`${slug}  (new project)`);
      continue;
    }
    const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
    if (meta.source?.generated !== asDate(fm.generated)) {
      pending.push(`${slug}  (context ${asDate(fm.generated)}, last intake ${meta.source?.generated ?? 'never'})`);
    }
  }
  if (pending.length === 0) console.log('No pending portfolio contexts.');
  else console.log(`Pending portfolio contexts (${pending.length}):\n  ${pending.join('\n  ')}`);
  process.exit(0);
}

let failed = 0;
if (args[0] === '--file') {
  const file = args[1];
  failed += report(file, checkContext(file));
} else if (args.length === 0) {
  console.log('usage: check-context.mjs <slug> … | --file <path> | --pending');
  process.exit(2);
} else {
  for (const slug of args) {
    failed += report(slug, checkContext(join(PROJECTS, slug, 'PORTFOLIO_CONTEXT.md'), slug));
  }
}
process.exit(failed ? 1 : 0);

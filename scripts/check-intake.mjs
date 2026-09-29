#!/usr/bin/env node
/**
 * Cross-checks a project's case study against the PORTFOLIO_CONTEXT.md it was
 * built from. The intake skill asks the writer to audit their own copy; this
 * does the parts of that audit a machine can do, because a self-audit misses
 * things (a Sonnet intake reported "every claim traced" over a sentence that
 * dated the launch to the first commit).
 *
 *   node scripts/check-intake.mjs <slug> [--base <git-rev>] [--context <path>]
 *
 * --base      the version before the intake, for "old copy" facts (default HEAD)
 * --context   the fact sheet (default content/projects/<slug>/PORTFOLIO_CONTEXT.md)
 *
 * Checks, all errors unless noted:
 *  1. numbers   every number in the visible story, tagline, glance and metrics
 *               appears in the fact sheet or in the --base version
 *  2. next      no "What I'd do next" / "Langkah berikutnya" section (removed
 *               site-wide on 30 Sep 2026: roadmaps go stale)
 *  3. launch    no "live since …" / "launched in …" unless `launched` is a date
 *  4. status    "in production" only for live/internal; "is live" not for staging
 *  5. hosts     no domain that isn't the project's own URLs or already published
 *  6. source    meta.source.generated matches the fact sheet
 *  7. stack     technologies named in prose but missing from techStack (warning)
 *  8. usage     a sentence or metric saying something is used/shared/served by
 *               N must take N from a section 5 row about people (users, staff,
 *               employees, visitors…). "43 units the system files documents
 *               under" is not "43 units use it".
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';

const ROOT = new URL('..', import.meta.url).pathname;
const PROJECTS = join(ROOT, 'content/projects');

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--base' && args[args.indexOf(a) - 1] !== '--context');
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
if (!slug) {
  console.log('usage: check-intake.mjs <slug> [--base <git-rev>] [--context <path>]');
  process.exit(2);
}
const base = opt('--base', 'HEAD');
const contextPath = opt('--context', join(PROJECTS, slug, 'PORTFOLIO_CONTEXT.md'));

const errors = [];
const warnings = [];

if (!existsSync(contextPath)) {
  console.log(`no fact sheet at ${contextPath}`);
  process.exit(1);
}
const ctxRaw = readFileSync(contextPath, 'utf8');
const { data: fm, content: ctxBody } = matter(ctxRaw);
const asDate = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? null : String(v));

const read = (f) => readFileSync(join(PROJECTS, slug, f), 'utf8');
const meta = JSON.parse(read('meta.json'));
const en = read('en.mdx');
const id = read('id.mdx');

const atBase = (f) => {
  try {
    return execFileSync('git', ['show', `${base}:content/projects/${slug}/${f}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
};
const oldCopy = ['meta.json', 'en.mdx', 'id.mdx'].map(atBase).join('\n');

// ---- helpers ------------------------------------------------------------

const HOOD = /^##\s+(Under the hood|Di balik layar)\s*$/m;
const visible = (mdx) => {
  const m = HOOD.exec(mdx);
  return (m ? mdx.slice(0, m.index) : mdx).replace(/^#.*$/gm, '');
};
const section = (mdx, heading) => {
  const re = new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'm');
  return re.exec(mdx)?.[1] ?? null;
};
const ctxSection = (n) => {
  const re = new RegExp(`^##\\s+${n}\\.[^\\n]*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'm');
  return (re.exec(ctxBody)?.[1] ?? '').trim();
};

const WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100,
  satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5, enam: 6, tujuh: 7, delapan: 8, sembilan: 9,
  sepuluh: 10, sebelas: 11, 'dua belas': 12, 'lima belas': 15, 'dua puluh': 20, 'tiga puluh': 30,
  'lima puluh': 50, seratus: 100,
};
// "2,200", "2.200", "~2,200" and "2200" are the same number; so are "3.1M"
// and "3,1 juta" (both reduce to "31"). Crude, but it only has to agree with
// itself on both sides of the comparison.
const norm = (s) => s.replace(/[.,]/g, '').replace(/^0+(?=\d)/, '');
function numbers(text, { words = true } = {}) {
  const out = new Set();
  for (const m of text.matchAll(/\d[\d.,]*/g)) out.add(norm(m[0].replace(/[.,]$/, '')));
  if (words) {
    const lower = text.toLowerCase();
    for (const [w, n] of Object.entries(WORDS)) {
      if (new RegExp(`\\b${w}\\b`).test(lower)) out.add(String(n));
    }
  }
  return out;
}
const sourced = new Set([...numbers(ctxRaw), ...numbers(oldCopy)]);
// Small counts ("two portals", "one function") are phrasing more often than
// claims; flag from 4 up, and every year.
const worth = (n) => Number(n) >= 4 || /^(19|20)\d\d$/.test(n);

// ---- 1. numbers -----------------------------------------------------------

const claimText = [
  visible(en),
  meta.tagline,
  meta.glance?.for,
  meta.glance?.result,
  ...(meta.metrics ?? []).flatMap((m) => [m.value, m.label]),
].join('\n');
const numberWordsOnly = (t) => numbers(t, { words: true });
const unsourced = [...numberWordsOnly(claimText)].filter((n) => worth(n) && !sourced.has(n));
if (unsourced.length) {
  errors.push(`numbers not in the fact sheet or the previous version: ${unsourced.join(', ')}`);
}

// ---- 2. next steps ----------------------------------------------------------

for (const [label, mdx, heading] of [
  ['en', en, "What I'd do next"],
  ['id', id, 'Langkah berikutnya'],
]) {
  if (section(mdx, heading) !== null) {
    errors.push(`${label}: "${heading}" section exists — the site has no next-steps section; remove it`);
  }
}

// ---- 3. launch date ---------------------------------------------------------

const launched = asDate(fm.launched);
if (!launched) {
  const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
  const BULAN = 'Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember';
  const enLaunch = new RegExp(`\\b(live|launched|in production|running|deployed|in use)\\b[^.]{0,60}\\bsince\\b|\\blaunched (in|on) (${MONTHS}|\\d{4})|\\b(since|after|before) (the )?launch\\b`, 'i');
  const idLaunch = new RegExp(`\\b(live|diluncurkan|berjalan|dipakai|beroperasi)\\b[^.]{0,60}\\bsejak\\b|\\bdiluncurkan (pada )?(${BULAN}|\\d{4})|\\b(sejak|setelah|sebelum) (di)?(luncurkan|peluncuran|rilis)\\b`, 'i');
  const hit = (re, t) => re.exec(t)?.[0];
  const e = hit(enLaunch, visible(en) + '\n' + (meta.glance?.result ?? ''));
  const i = hit(idLaunch, visible(id) + '\n' + (meta.id?.glance?.result ?? ''));
  if (e) errors.push(`en: dates the launch ("${e}") but launched is null`);
  if (i) errors.push(`id: dates the launch ("${i}") but launched is null`);
}

// ---- 4. status words --------------------------------------------------------

const allCopy = [visible(en), visible(id), JSON.stringify(meta.glance ?? {}), JSON.stringify(meta.id?.glance ?? {})].join('\n');
if (!['live', 'internal'].includes(fm.status) && /\bin production\b|\bdi produksi\b|\bproduction\b/i.test(allCopy)) {
  errors.push(`copy says "production" but status is "${fm.status}"`);
}
if (fm.status === 'staging' && /\bis live\b|\bsudah live\b/i.test(allCopy)) {
  errors.push('copy says "live" but status is "staging"');
}
if (['private', 'unreleased'].includes(fm.status) && /\bis live\b|\bsudah live\b/i.test(allCopy)) {
  errors.push(`copy says "live" but status is "${fm.status}"`);
}

// ---- 5. hostnames -----------------------------------------------------------

const hostOf = (u) => {
  try {
    return new URL(u).hostname;
  } catch {
    return null;
  }
};
const knownHosts = new Set(
  [fm.liveUrl, fm.stagingUrl, fm.githubUrl, meta.liveUrl, ...(Array.isArray(meta.githubUrl) ? meta.githubUrl : [meta.githubUrl])]
    .filter(Boolean)
    .map(hostOf)
    .filter(Boolean)
);
const HOST = /\b(?:[a-z0-9-]+\.)+(?:id|com|io|org|net|dev|app|go\.id|co\.id|ac\.id)\b/gi;
const oldHosts = new Set((oldCopy.match(HOST) ?? []).map((h) => h.toLowerCase()));
const newHosts = [...new Set([en, id, JSON.stringify(meta)].join('\n').match(HOST) ?? [])]
  .map((h) => h.toLowerCase())
  .filter((h) => !/\.(js|ts|tsx|py|json|md|mdx|css)$/.test(h) && !/^(next|node|vue|d3|three|chart|socket)\.js$/.test(h))
  .filter((h) => ![...knownHosts].some((k) => k === h || k.endsWith(`.${h}`) || h.endsWith(`.${k}`)))
  .filter((h) => !oldHosts.has(h));
if (newHosts.length) errors.push(`hostnames not among the project's own URLs: ${newHosts.join(', ')} (section 9 may forbid them)`);

// ---- 6. source marker -------------------------------------------------------

if (meta.source?.generated !== asDate(fm.generated)) {
  errors.push(`meta.source.generated is "${meta.source?.generated}", fact sheet generated is "${asDate(fm.generated)}"`);
}

// ---- 7. stack consistency (warning) ------------------------------------------

const everyTech = new Set();
for (const d of readdirSync(PROJECTS)) {
  const f = join(PROJECTS, d, 'meta.json');
  if (existsSync(f)) for (const t of JSON.parse(readFileSync(f, 'utf8')).techStack ?? []) everyTech.add(t);
}
const stack = new Set(meta.techStack ?? []);
const named = [...everyTech].filter((t) => t.length > 3 && !stack.has(t) && new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(en));
if (named.length) warnings.push(`named in en.mdx but not in techStack: ${named.join(', ')} — add it, or confirm the fact sheet supports it`);

// ---- 8. usage claims -------------------------------------------------------

const PEOPLE = /\b(users?|people|persons?|employees?|staff|visitors?|members?|citizens?|residents?|applicants?|students?|participants?|readers?|players?|patients?|downloads?|sessions?|visits?|pegawai|pengguna|warga|peserta|pengunjung)\b/i;
const USE_EN = /\b(use|uses|used|using|serve|serves|served|serving|share|shares|shared|sharing|relies on|rely on|adopted|visited)\b/i;
const USE_ID = /\b(pakai|memakai|dipakai|guna|menggunakan|digunakan|melayani|dilayani|berbagi|mengandalkan)\b/i;

const peopleNumbers = new Set();
for (const line of ctxSection(5).split('\n')) {
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 5) continue;
  const [, metric, value, kind] = cells;
  if (['impact', 'scale'].includes((kind ?? '').toLowerCase()) && PEOPLE.test(metric ?? '')) {
    for (const n of numbers(value ?? '')) peopleNumbers.add(n);
  }
}
const sentencesOf = (t) => t.split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
// The fact sheet may state usage in prose too ("Three groups use it"); a
// number it puts next to a usage verb is sourced.
for (const sentence of sentencesOf(ctxBody).filter((x) => USE_EN.test(x) && PEOPLE.test(x) || /\bgroups?\b/i.test(x) && USE_EN.test(x))) {
  for (const n of numbers(sentence)) peopleNumbers.add(n);
}
const usageClaims = [
  ...sentencesOf(visible(en)).filter((x) => USE_EN.test(x)),
  ...sentencesOf(visible(id)).filter((x) => USE_ID.test(x)),
  ...[meta.glance?.for, meta.glance?.result].filter((x) => x && USE_EN.test(x)),
  ...(meta.metrics ?? []).filter((m) => USE_EN.test(m.label)).map((m) => `${m.value} ${m.label}`),
  ...(meta.id?.metrics ?? []).filter((m) => USE_ID.test(m.label)).map((m) => `${m.value} ${m.label}`),
];
for (const claim of usageClaims) {
  const bad = [...numbers(claim)].filter((n) => Number(n) >= 2 && !/^(19|20)\d\d$/.test(n) && !peopleNumbers.has(n));
  if (bad.length) {
    errors.push(`usage claim with a number not from a section 5 row about people: "${claim.trim().slice(0, 90)}"`);
  }
}

// ---- report -----------------------------------------------------------------

console.log(`\n${slug}  ${errors.length ? '✕' : '✓'}   (base ${base}, context generated ${asDate(fm.generated)})`);
for (const e of errors) console.log(`  error · ${e}`);
for (const w of warnings) console.log(`  warn  · ${w}`);
process.exit(errors.length ? 1 : 0);

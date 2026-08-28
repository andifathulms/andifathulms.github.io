#!/usr/bin/env node
/**
 * Fails the build when a project image is far larger than the size it renders at.
 *
 * `images.unoptimized` is mandatory for static export, so whatever is committed
 * ships byte-for-byte. This has regressed twice: 35 icons at 512–1024px (1.78 MB
 * to paint 32px squares), then six more after the rule was written into
 * CLAUDE.md. A note nobody has to obey is not a rule — this is.
 *
 * Vanilla Node, no dependencies: dimensions are read from the file headers.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PROJECTS = join(ROOT, 'public/images/projects');

// Ceilings, not targets. Each sits above every asset currently committed, so
// the guard only fires on a genuine regression rather than on normal variance.
const BUDGET = {
  icon: { maxPx: 256, maxKB: 24, rendersAt: '32–56px' },
  hero: { maxPx: 1920, maxKB: 220, rendersAt: 'full-bleed banner' },
  screenshot: { maxPx: 1920, maxKB: 220, rendersAt: 'half-width grid / lightbox' },
};

function pngSize(buf) {
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

function webpSize(buf) {
  const fourcc = buf.toString('ascii', 12, 16);
  if (fourcc === 'VP8X') {
    return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  }
  if (fourcc === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
  }
  if (fourcc === 'VP8 ') {
    return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  }
  return null;
}

function jpegSize(buf) {
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    // SOF0–SOF15, excluding the non-frame markers DHT/JPG/DAC.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function dimensions(file) {
  const buf = readFileSync(file);
  if (file.endsWith('.png')) return pngSize(buf);
  if (file.endsWith('.webp')) return webpSize(buf);
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return jpegSize(buf);
  return null;
}

function kindOf(rel) {
  if (/\/icon\.[a-z]+$/.test(rel)) return 'icon';
  if (/\/hero\.[a-z]+$/.test(rel)) return 'hero';
  if (rel.includes('/screenshots/')) return 'screenshot';
  return null;
}

if (!existsSync(PROJECTS)) process.exit(0);

const files = [];
for (const slug of readdirSync(PROJECTS)) {
  const dir = join(PROJECTS, slug);
  if (!statSync(dir).isDirectory()) continue;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry === 'screenshots') {
        for (const s of readdirSync(p)) files.push(join(p, s));
      }
      continue;
    }
    files.push(p);
  }
}

const problems = [];
for (const file of files) {
  const rel = relative(ROOT, file);
  const kind = kindOf(rel);
  if (!kind) continue;
  if (!/\.(png|jpe?g|webp|svg)$/i.test(rel)) continue;
  if (rel.endsWith('.svg')) continue; // vector: no pixel budget to bust

  const budget = BUDGET[kind];
  const kb = Math.round(statSync(file).size / 1024);
  const dim = dimensions(file);

  if (dim && Math.max(dim[0], dim[1]) > budget.maxPx) {
    problems.push(
      `${rel}\n    ${dim[0]}x${dim[1]} exceeds the ${budget.maxPx}px ceiling for a ${kind} (renders at ${budget.rendersAt})`
    );
  } else if (kb > budget.maxKB) {
    problems.push(`${rel}\n    ${kb}KB exceeds the ${budget.maxKB}KB ceiling for a ${kind}`);
  }
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} oversized project image(s):\n`);
  for (const p of problems) console.error(`  ${p}\n`);
  console.error(
    '  Static export ships these byte-for-byte — images.unoptimized is required,\n' +
      '  so nothing downscales them at build or request time.\n\n' +
      '  Fix:  cwebp -q 82 -resize 128 128 icon.png -o icon.webp && rm icon.png\n' +
      '        cwebp -q 82 -resize 1600 0  hero.jpeg -o hero.webp && rm hero.jpeg\n\n' +
      '  getProjectIcon() resolves svg -> png -> webp, so delete the original:\n' +
      '  a leftover PNG beside a small WebP still wins.\n'
  );
  process.exit(1);
}

console.log(`✓ ${files.length} project images within budget`);

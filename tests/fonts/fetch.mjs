#!/usr/bin/env node
/* Chromium in CI cannot reach fonts.googleapis.com, and each blocked request
   stalls page load by ~12s. Worse, the typography pass would then be measuring
   the fallback stack rather than the real font metrics, which is the opposite
   of useful. This caches the stylesheet and its woff2 files so the fixture can
   serve them locally. curl is used because it honours the environment proxy. */
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const CSS_URL = 'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap';
/* Ask as Chrome, or Google serves the legacy ttf payload. */
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const get = (url, binary) =>
  execFileSync('curl', ['-sSL', '--max-time', '25', '-A', UA, url],
    { encoding: binary ? 'buffer' : 'utf8', maxBuffer: 32 * 1024 * 1024 });

mkdirSync(DIR, { recursive: true });
const manifest = {};

const css = get(CSS_URL, false);
writeFileSync(join(DIR, 'fonts.css'), css);
manifest[CSS_URL] = { file: 'fonts.css', type: 'text/css' };

const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1]))];
urls.forEach((u, i) => {
  const file = `f${i}.woff2`;
  writeFileSync(join(DIR, file), get(u, true));
  manifest[u] = { file, type: 'font/woff2' };
});

writeFileSync(join(DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`cached 1 stylesheet + ${urls.length} font file(s) → tests/fonts/`);

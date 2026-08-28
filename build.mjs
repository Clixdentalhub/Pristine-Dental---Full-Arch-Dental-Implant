#!/usr/bin/env node
/* =========================================================================
   P13 · DEPLOYMENT BUILD
   Produces standalone paste-and-go documents in dist/: every local image is
   inlined as a data URI, so there is no assets folder to upload alongside
   them.
   ========================================================================= */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join, extname, resolve } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'dist');
const DOCS = ['index.html', 'thank-you.html'];

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif',
};

const kb = (n) => (n / 1024).toFixed(1) + ' KB';

async function build(doc) {
  let html = await readFile(join(ROOT, doc), 'utf8');
  const inlined = [];
  const missing = [];
  let rawBytes = 0;

  const srcs = [...new Set([...html.matchAll(/(?:src|href)="((?!https?:|data:|mailto:|tel:|#)[^"]+\.(?:jpe?g|png|webp|gif|svg|avif))"/gi)]
    .map((m) => m[1]))];

  for (const src of srcs) {
    const file = resolve(ROOT, src);
    try {
      const buf = await readFile(file);
      const mime = MIME[extname(file).toLowerCase()];
      if (!mime) { missing.push(src + ' (unknown type)'); continue; }
      const uri = `data:${mime};base64,${buf.toString('base64')}`;
      html = html.split(`"${src}"`).join(`"${uri}"`);
      rawBytes += buf.length;
      inlined.push({ src, bytes: buf.length });
    } catch {
      missing.push(src);
    }
  }

  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, doc), html);

  return { doc, inlined, missing, rawBytes, outBytes: Buffer.byteLength(html) };
}

/* Anything that only resolves while the files sit in one folder. */
function relativeLinks(html) {
  return [...new Set([...html.matchAll(/href="((?!https?:|data:|mailto:|tel:|#)[^"]+\.html[^"]*)"/gi)].map((m) => m[1]))];
}

const results = [];
for (const doc of DOCS) results.push(await build(doc));

console.log('\n─── BUILD ───────────────────────────────────────────────────');
let anyMissing = false;
for (const r of results) {
  console.log(`\n  dist/${r.doc}  ${kb(r.outBytes)}`);
  console.log(`    ${r.inlined.length} image(s) inlined, ${kb(r.rawBytes)} of source files`);
  for (const i of r.inlined) console.log(`      · ${i.src} — ${kb(i.bytes)}`);
  if (r.missing.length) {
    anyMissing = true;
    console.log(`    ${r.missing.length} image(s) NOT FOUND — these ship as labelled slots:`);
    for (const m of r.missing) console.log(`      · ${m}`);
  }
}

console.log('\n─── THE TRADE-OFF ───────────────────────────────────────────');
console.log(`
  A data URI cannot be cached separately from the document, and base64
  costs about a third more bytes than the file itself. Every visitor
  therefore re-downloads the whole payload on every visit, including
  repeat visits and every page in the funnel.

  Inlining is the get-it-live-today option: one file, nothing else to
  upload, paste it into the builder and it works.

  Hosting the images and keeping URL src attributes is the FAST option.
  If this campaign is going to run for more than a few days, host them.
`);

console.log('─── BEFORE YOU PUBLISH ──────────────────────────────────────\n');
const todo = [];
for (const doc of DOCS) {
  const html = await readFile(join(ROOT, doc), 'utf8');
  for (const l of relativeLinks(html)) {
    todo.push(`${doc}: href="${l}" is relative — it only resolves while both documents sit in the same folder. Set the absolute published URL if they do not.`);
  }
  const phs = [...new Set([...html.matchAll(/class="ph"[^>]*>([^<]+)</g)].map((m) => m[1].trim()))];
  for (const p of phs) todo.push(`${doc}: unresolved value — ${p}`);
  const needs = [...new Set([...html.matchAll(/data-needs="([^"]+)"/g)].map((m) => m[1]))];
  for (const n of needs) todo.push(`${doc}: unresolved destination — ${n}`);
  if (/name="robots"[^>]*noindex/.test(html)) todo.push(`${doc}: still carries noindex.`);
  if (/var ENDPOINT = null/.test(html)) todo.push(`${doc}: form ENDPOINT is null — leads are not being posted anywhere.`);
}
if (anyMissing) todo.unshift('Supply the outstanding photography listed above, then rebuild.');
todo.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. ${t}`));
console.log(`\n  ${todo.length} item(s) outstanding.\n`);

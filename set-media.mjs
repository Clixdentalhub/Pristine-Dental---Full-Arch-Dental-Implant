#!/usr/bin/env node
/* Repoints every media reference in the documents at hosted URLs.

     node set-media.mjs --init     # write media.json listing every slot
     node set-media.mjs            # apply media.json to the documents
     node set-media.mjs --revert   # put the local assets/ paths back

   Why this exists: the current live funnel already serves its images from the
   GoHighLevel CDN. Uploading this campaign's media to the same media library
   gives every file a public URL, and pasting those in here means the pages
   need no assets folder at all - one file, paste and go, and the images stay
   separately cacheable. That is the fast option; inlining via build.mjs is the
   get-it-live-today one. */
import { readFile, writeFile, access } from 'node:fs/promises';

const DOCS = ['index.html', 'thank-you.html'];
const MAP = 'media.json';
const REF = /(?:src|poster)="(assets\/[^"]+)"|url\((assets\/[^)]+)\)/g;

const mode = process.argv[2] || '';

async function slots() {
  const found = new Set();
  for (const doc of DOCS) {
    const html = await readFile(doc, 'utf8');
    for (const m of html.matchAll(REF)) found.add(m[1] || m[2]);
  }
  return [...found].sort();
}

if (mode === '--init') {
  let existing = {};
  try { await access(MAP); existing = JSON.parse(await readFile(MAP, 'utf8')); } catch {}
  const out = {};
  for (const s of await slots()) out[s] = existing[s] || '';
  await writeFile(MAP, JSON.stringify(out, null, 2) + '\n');
  const blank = Object.values(out).filter((v) => !v).length;
  console.log(`\n${MAP} written — ${Object.keys(out).length} slot(s), ${blank} still blank.`);
  console.log(`Paste a hosted URL against each, then run:  node set-media.mjs\n`);
  process.exit(0);
}

let map;
try {
  map = JSON.parse(await readFile(MAP, 'utf8'));
} catch {
  console.error(`No ${MAP}. Run:  node set-media.mjs --init`);
  process.exit(1);
}

/* --revert needs the reverse direction, so build both lookups up front. */
const forward = new Map(Object.entries(map).filter(([, v]) => v));
const backward = new Map([...forward].map(([k, v]) => [v, k]));
const table = mode === '--revert' ? backward : forward;

if (!table.size) {
  console.error(`${MAP} has no URLs filled in yet — nothing to ${mode === '--revert' ? 'revert' : 'apply'}.`);
  process.exit(1);
}

let total = 0;
for (const doc of DOCS) {
  let html = await readFile(doc, 'utf8');
  let n = 0;
  for (const [from, to] of table) {
    const before = html;
    html = html.split(`"${from}"`).join(`"${to}"`).split(`url(${from})`).join(`url(${to})`);
    if (html !== before) n++;
  }
  await writeFile(doc, html);
  console.log(`  ${doc}: ${n} reference(s) repointed`);
  total += n;
}
const missing = Object.entries(map).filter(([, v]) => !v).map(([k]) => k);
if (missing.length && mode !== '--revert') {
  console.log(`\n${missing.length} slot(s) still have no URL and keep their local path:`);
  for (const m of missing) console.log(`  · ${m}`);
}
console.log(`\n${total} reference(s) updated. Re-run \`npm test\` before publishing.\n`);

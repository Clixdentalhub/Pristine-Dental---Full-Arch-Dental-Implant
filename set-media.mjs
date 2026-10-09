#!/usr/bin/env node
/* Repoints every media reference in the documents at hosted URLs.

     node set-media.mjs --slots        # which slots still need a URL
     node set-media.mjs --fill urls.txt  # fill empty slots from a list, in order
     node set-media.mjs                # apply media.json to the documents
     node set-media.mjs --revert       # put the local assets/ paths back
     node set-media.mjs --init         # rebuild media.json from the documents

   Google Drive is not an image host: its links need 'anyone with link', are
   rate-limited, and Google serves an interstitial rather than raw bytes for
   larger files. Upload to the GoHighLevel media library instead — the same
   place the current live funnel serves its images from — and paste those
   URLs here.

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

if (mode === '--slots') {
  /* Read the documents, not media.json. Once a slot has been given a URL its
     local path is gone from the page, so a manifest cannot rebuild itself —
     it goes stale the moment a section is added or removed. What is actually
     outstanding is whatever the page still cannot render. */
  const outstanding = [];
  for (const doc of DOCS) {
    const html = await readFile(doc, 'utf8');
    for (const m of html.matchAll(REF)) {
      outstanding.push({ doc, what: m[1] || m[2], why: 'local path, will 404 once published' });
    }
    for (const m of html.matchAll(/<div class="bg-video"[^>]*data-video="(\s*)"[^>]*>/g)) {
      outstanding.push({ doc, what: 'background video + poster', why: 'data-video / data-poster are empty' });
    }
    for (const m of html.matchAll(/photo: '',\s*slot: '([^']+)'/g)) {
      outstanding.push({ doc, what: m[1], why: 'roster entry has no portrait' });
    }
  }
  if (!outstanding.length) {
    console.log('\nNothing outstanding — every image in both documents resolves to a URL.\n');
    process.exit(0);
  }
  console.log(`\n${outstanding.length} thing(s) still need a hosted URL:\n`);
  for (const o of outstanding) console.log(`  ${o.doc.padEnd(16)} ${o.what.padEnd(38)} ${o.why}`);
  console.log(`\nUpload to the GHL media library, then either paste the URL straight into`);
  console.log(`the attribute, or list the URLs in a file and run --fill.\n`);
  process.exit(0);
}

if (mode === '--fill') {
  const listFile = process.argv[3];
  if (!listFile) { console.error('usage: node set-media.mjs --fill <file-of-urls>'); process.exit(1); }
  const urls = (await readFile(listFile, 'utf8')).split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  const map = JSON.parse(await readFile(MAP, 'utf8'));
  const empty = Object.entries(map).filter(([, v]) => !v).map(([k]) => k);

  if (urls.length > empty.length) {
    console.error(`${urls.length} URLs but only ${empty.length} empty slot(s). Nothing written.`);
    process.exit(1);
  }
  urls.forEach((u, i) => { map[empty[i]] = u; });
  await writeFile(MAP, JSON.stringify(map, null, 2) + '\n');

  console.log(`\nAssigned in order — check these before applying:\n`);
  urls.forEach((u, i) => console.log(`  ${empty[i].padEnd(38)} ← ${u.split('/').pop()}`));
  if (urls.length < empty.length) {
    console.log(`\n${empty.length - urls.length} slot(s) still empty:`);
    for (const k of empty.slice(urls.length)) console.log(`  ${k}`);
  }
  console.log(`\nWrong order? Edit ${MAP}. Then:  node set-media.mjs\n`);
  process.exit(0);
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

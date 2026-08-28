#!/usr/bin/env node
/* Builds ghl.html — one paste-ready fragment for a GoHighLevel custom-code block.

     node build-ghl.mjs

   A GHL page is already a document, so a second <!doctype html>/<html>/<head>/
   <body> cannot nest inside it. This emits the page content only: the font
   import, the stylesheets, the markup and the scripts.

   Three transformations matter:

   1. Everything is wrapped in .pdg and every `body` rule is rescoped to it, so
      the funnel cannot restyle the rest of the GHL page. `html` rules stay put
      because anchor scrolling resolves from them.

   2. Any image still pointing at a local assets/ path is REMOVED, along with
      its labelled slot. In this repo a missing file degrades to a slot naming
      what it wants, which is right while building — but pasted into a live
      builder it reads as a broken page. Better an intentional empty frame.

   3. A section whose media is entirely missing is dropped whole, rather than
      shipped as a row of empty frames. What was dropped is printed. */
import { readFile, writeFile } from 'node:fs/promises';

const src = await readFile('index.html', 'utf8');
const FONTS = (src.match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/) || [])[1];

let styles = [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
let body = src.match(/<body>([\s\S]*)<\/body>/)[1];
const scripts = [...body.matchAll(/<script[\s\S]*?<\/script>/g)].map((m) => m[0]);
body = body.replace(/<script[\s\S]*?<\/script>/g, '');

/* 1 · rescope body → .pdg so the funnel cannot restyle the host page */
styles = styles
  .replace(/(^|\})\s*body\s*\{/g, '$1\n.pdg{')
  .replace(/([^a-zA-Z-])body\s+/g, '$1.pdg ');

/* 2 · Drop a section whose media never arrived — decided by reading the
      section, not from a list kept by hand, so it stays right as media.json
      is filled in. A section counts as unusable when it has image slots and
      every one of them still points at a local path. */
const dropped = [];
for (const m of [...body.matchAll(/<section[^>]*id="([a-z-]+)"[\s\S]*?\n<\/section>/g)]) {
  const [block, id] = m;
  const imgs = [...block.matchAll(/<img[^>]+src="([^"]+)"/g)].map((x) => x[1]);
  if (imgs.length < 2 || imgs.some((u) => /^https?:/.test(u))) continue;
  body = body.replace(block, `\n<!-- section "${id}" omitted: ${imgs.length} images, none supplied -->\n`);
  dropped.push({ id, why: `${imgs.length} images, none supplied` });
}
/* and their nav links, so nothing points at a section that is gone */
for (const { id } of dropped) {
  body = body.replace(new RegExp(`\\s*<li><a href="#${id}">[^<]*</a></li>`, 'g'), '');
}
/* and their nav links, so nothing points at a section that is gone */
for (const { id } of dropped) {
  body = body.replace(new RegExp(`\\s*<li><a href="#${id}">[^<]*</a></li>`, 'g'), '');
}

/* 3 · strip images that still point at a local path, and their slots */
const localImg = /\s*<img[^>]+src="assets\/[^"]+"[^>]*>/g;
const stripped = (body.match(localImg) || []).length;
body = body.replace(localImg, '');
body = body.replace(/\s*data-slot="[^"]*"/g, '');          // the labelled slot is meaningless now
body = body.replace(/<span class="card-photo-bg"[^>]*style="background-image:url\(assets\/[^)]*\)"[^>]*><\/span>/g, '');
body = body.replace(/\s*poster="assets\/[^"]*"/g, '');
body = body.replace(/<source src="assets\/[^"]*"[^>]*>/g, '');

const out = [
  `<!-- Pristine Dental Group — full arch funnel.`,
  `     Paste into a GoHighLevel custom-code block. Page content only - the`,
  `     document wrapper is omitted, because the GHL page already provides it. -->`,
  FONTS ? `<style>@import url("${FONTS}");</style>` : '',
  `<style>\n${styles}\n</style>`,
  `<div class="pdg">`,
  body.trim(),
  `</div>`,
  ...scripts,
].filter(Boolean).join('\n');

await writeFile('ghl.html', out);

const kb = (n) => (Buffer.byteLength(n) / 1024).toFixed(0) + ' KB';
console.log(`\nghl.html  ${kb(out)}`);
console.log(`  hosted images kept   : ${(out.match(/src="https:\/\//g) || []).length}`);
console.log(`  local images stripped: ${stripped}`);
for (const { id, why } of dropped) console.log(`  section dropped      : #${id} — ${why}`);
const leftovers = [...new Set([...out.matchAll(/(?:src|poster)="(assets\/[^"]+)"/g)].map((m) => m[1]))];
console.log(leftovers.length ? `  STILL LOCAL: ${leftovers.join(', ')}` : `  no local paths remain`);
console.log(`\nFill media.json and re-run to keep more of the page.\n`);

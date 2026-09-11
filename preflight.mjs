#!/usr/bin/env node
/* Pre-publish checklist. Reads the documents rather than a list kept by hand,
   so it cannot go stale.

   Embedding images is embed-images.py's job — this used to duplicate it. */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DOCS = ['index.html', 'thank-you.html'];
const relativeLinks = (html) =>
  [...new Set([...html.matchAll(/href="((?!https?:|data:|mailto:|tel:|#)[^"]+\.html[^"]*)"/gi)].map((m) => m[1]))];

console.log('\n─── BEFORE YOU PUBLISH ──────────────────────────────────────\n');
const todo = [];
for (const doc of DOCS) {
  const html = await readFile(doc, 'utf8');
  for (const l of relativeLinks(html)) {
    todo.push(`${doc}: href="${l}" is relative — it only resolves while both documents sit in the same folder.`);
  }
  const local = [...new Set([...html.matchAll(/(?:src|poster)="((?!https?:|data:)assets\/[^"]+)"/g)].map((m) => m[1]))];
  if (local.length) todo.push(`${doc}: ${local.length} media reference(s) still point at a local assets/ path — see media.json.`);
  for (const p of new Set([...html.matchAll(/class="ph"[^>]*>([^<]+)</g)].map((m) => m[1].trim()))) {
    todo.push(`${doc}: unresolved value — ${p}`);
  }
  for (const n of new Set([...html.matchAll(/data-needs="([^"]+)"/g)].map((m) => m[1]))) {
    todo.push(`${doc}: unresolved destination — ${n}`);
  }
  // noindex is permanent on the confirmation page, so only flag it on the funnel
  if (doc === 'index.html' && /name="robots"[^>]*noindex/.test(html)) todo.push(`${doc}: still carries noindex.`);
  if (/var ENDPOINT = null/.test(html)) todo.push(`${doc}: form ENDPOINT is null — leads are not being posted anywhere.`);
}
todo.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. ${t}`));
console.log(`\n  ${todo.length} item(s) outstanding.\n`);

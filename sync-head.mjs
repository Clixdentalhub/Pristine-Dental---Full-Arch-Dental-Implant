#!/usr/bin/env node
/* Both documents are self-contained by design, which means the token block
   is physically duplicated. This copies <head> from index.html into every
   other document so the two can never drift, rewriting only the per-page
   title, description and robots directive. Run it after touching tokens. */
import { readFile, writeFile } from 'node:fs/promises';

const HEAD = /^[\s\S]*?<\/head>/;
const src = await readFile('index.html', 'utf8');
const head = src.match(HEAD)[0];

const PAGES = [{
  file: 'thank-you.html',
  title: 'Request received — Pristine Dental Group',
  description: 'Your free full arch implant consultation request has been received by Pristine Dental Group.',
  robotsNote: `<!-- noindex is PERMANENT on this page. A confirmation page that ranks is one
     people reach without converting, which silently inflates every conversion
     fired on it. Do not remove this when the funnel page goes live. -->`,
}];

for (const p of PAGES) {
  const doc = await readFile(p.file, 'utf8');
  let h = head
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${p.title}</title>`)
    .replace(/<meta name="description" content="[\s\S]*?">/, `<meta name="description" content="${p.description}">`)
    .replace(/<!-- noindex[\s\S]*?-->/, p.robotsNote);
  await writeFile(p.file, doc.replace(HEAD, () => h));
  console.log(`synced <head> → ${p.file}`);
}

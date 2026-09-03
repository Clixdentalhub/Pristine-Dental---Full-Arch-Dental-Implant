#!/usr/bin/env node
/* Builds the hosted-preview copies of the two documents.
   The Artifact host supplies its own <!doctype>/<html>/<head>/<body>, so the
   page content ships without them: <title>, the font @import, every <style>
   block, then the body's inner HTML. Nothing about the design changes. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const OUT = process.argv[2] || 'preview';
await mkdir(OUT, { recursive: true });

const FONTS = 'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap';

/* The host's CSP admits no frames, so the map embed would render as an empty
   box. A real panel with the address and an outbound link is honest here. */
const MAP = `<div style="border:1px solid #2C2620;border-radius:var(--r-md);background:#141210;padding:var(--s-4);display:flex;flex-direction:column;gap:12px;min-height:340px;justify-content:center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--color-flourish)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4.4 8-11a8 8 0 1 0-16 0c0 6.6 8 11 8 11Z"/><circle cx="12" cy="11" r="2.6"/></svg>
          <p style="margin:0;font-family:var(--font-head);font-weight:600;color:#fff;font-size:1.05rem">Pristine Dental Group</p>
          <p style="margin:0">499 Kingsbury Road<br>London NW9 9ED</p>
          <p style="margin:0"><a href="https://www.google.com/maps/search/?api=1&amp;query=499+Kingsbury+Road+London+NW9+9ED" target="_blank" rel="noopener" style="color:var(--cta-on-dark);font-weight:600">Open in Google Maps</a></p>
          <p style="margin:0;font-size:.8rem;color:#8A8377">The live page carries an embedded map here. Frames are blocked on this preview host.</p>
        </div>`;

async function build(src, dest, rewrites = []) {
  const html = await readFile(src, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/)[1];
  const styles = [...html.matchAll(/<style>[\s\S]*?<\/style>/g)].map((m) => m[0]);
  let body = html.match(/<body>([\s\S]*)<\/body>/)[1];

  body = body.replace(/<iframe[\s\S]*?<\/iframe>/, MAP);
  for (const [from, to] of rewrites) body = body.split(from).join(to);

  const out = [
    `<title>${title}</title>`,
    `<style>@import url("${FONTS}");</style>`,
    ...styles,
    body,
  ].join('\n');

  await writeFile(`${OUT}/${dest}`, out);
  console.log(`${dest} — ${(Buffer.byteLength(out) / 1024).toFixed(0)} KB, ${styles.length} style blocks`);
}

const FUNNEL_TITLE = 'Pristine Full Arch Funnel';
const THANKS_TITLE = 'Full Arch Confirmation';

await build('index.html', 'funnel.html', [
  ['<title>Full Arch Dental Implants London — £1,500 Off, From £116/Month | Pristine Dental Group</title>', ''],
  [`var THANK_YOU = 'thank-you.html';`, `var THANK_YOU = '${process.env.THANKS_URL || 'thank-you.html'}';`],
]);
await build('thank-you.html', 'thankyou.html', [
  ['href="index.html"', `href="${process.env.FUNNEL_URL || 'index.html'}"`],
  ['href="index.html#faq"', `href="${process.env.FUNNEL_URL || 'index.html'}"`],
  ['href="index.html#pricing"', `href="${process.env.FUNNEL_URL || 'index.html'}"`],
]);

/* the <title> the host reads is the first one in the file */
for (const [file, name] of [['funnel.html', FUNNEL_TITLE], ['thankyou.html', THANKS_TITLE]]) {
  const p = `${OUT}/${file}`;
  const s = await readFile(p, 'utf8');
  await writeFile(p, s.replace(/<title>[\s\S]*?<\/title>/, `<title>${name}</title>`));
}
console.log('titles set');

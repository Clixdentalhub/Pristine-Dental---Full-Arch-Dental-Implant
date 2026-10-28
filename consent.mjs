#!/usr/bin/env node
/* Adds — or refreshes — the cookie consent on every funnel page.

     node consent.mjs

   partials/consent-head.html   Consent Mode defaults, inserted just above
                                Google Tag Manager in <head>
   partials/consent-banner.html the banner, inserted before </body>
   footer                       a "Cookie settings" link that reopens it

   Safe to re-run: marked blocks are replaced, not duplicated. It also writes
   ghl-consent-head.html — inside GoHighLevel, GTM lives in the funnel's
   tracking code, so the defaults have to be pasted there, ABOVE the GTM
   snippet. The banner itself travels in each page's GHL fragment. */
import { readFile, writeFile, readdir } from 'node:fs/promises';

const HEAD = (await readFile('partials/consent-head.html', 'utf8')).trim();
const BANNER = (await readFile('partials/consent-banner.html', 'utf8')).trim();
const GTM = '<!-- Google Tag Manager -->';
const REOPEN = ' · <button type="button" class="cc-reopen" data-cc-open>Cookie settings</button>';

const pages = (await readdir('.')).filter((f) => f.endsWith('.html') && !/^ghl[-.]/.test(f));
for (const f of pages) {
  let s = await readFile(f, 'utf8');
  if (!s.includes(GTM) || !s.includes('</body>')) { console.log(`skip  ${f}`); continue; }

  s = s.replace(/<!-- consent:head -->[\s\S]*?<!-- \/consent:head -->\n?/, '');
  s = s.replace(GTM, `${HEAD}\n${GTM}`);

  s = s.replace(/<!-- consent:banner -->[\s\S]*?<!-- \/consent:banner -->\n?/, '');
  s = s.replace('</body>', `${BANNER}\n</body>`);

  if (!s.includes('class="cc-reopen"')) s = s.replace('All rights reserved.</p>', `All rights reserved.${REOPEN}</p>`);

  await writeFile(f, s);
  console.log(`ok    ${f}`);
}

await writeFile('ghl-consent-head.html',
  `<!-- Pristine Dental Group — cookie consent defaults for GoHighLevel.
     Paste into the funnel's Settings → Tracking Code → Head, ABOVE the
     Google Tag Manager snippet. Once per funnel (it covers every step). -->
${HEAD.replace(/<!-- \/?consent:head -->\n?/g, '').trim()}
`);
console.log('ok    ghl-consent-head.html');

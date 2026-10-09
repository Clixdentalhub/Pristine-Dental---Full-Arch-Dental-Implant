import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

/* Copy rule (see CLAUDE.md): the word "specialist", in any form, never appears
   in a funnel — page copy, meta, JSON-LD, alt text or the GHL paste files.
   It is a GDC-protected title. Scans every .html file in the repo root. */
test('copy rules — no "specialist" in any page or paste file', () => {
  const hits = [];
  for (const f of readdirSync('.').filter((n) => n.endsWith('.html'))) {
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      const m = line.match(/[^<>"]{0,40}specialist[^<>"]{0,40}/i);
      if (m) hits.push(`${f}:${i + 1}  …${m[0].trim()}…`);
    });
  }
  expect(hits, 'the word "specialist" is banned in funnel copy — see CLAUDE.md').toEqual([]);
});

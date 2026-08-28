import { test, expect } from './fixtures.mjs';
import { PAGES, ratio, parseRGB } from './helpers.mjs';

/* Contrast is computed from relative luminance for every text/background
   pair actually rendered on a dark band — not asserted against the token
   list, which would only prove the tokens agree with themselves. */
for (const path of PAGES) {
  test(`${path} — contrast on dark bands`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });   // the mobile bar only exists here
    await page.goto(path, { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, 800));         // reveal the sticky bar
    await page.waitForTimeout(400);

    const pairs = await page.evaluate(() => {
      const out = [];
      /* Every dark surface, not just the section bands. The sticky mobile
         bar was missing from this list and hid an invisible CTA. */
      const roots = document.querySelectorAll(
        '.dark, .deep, .site-header, .nav-rail, .site-footer, .form-card, .hero, .mobile-bar');

      function effectiveBg(el) {
        let node = el;
        while (node && node !== document.documentElement) {
          const bg = getComputedStyle(node).backgroundColor;
          const m = bg.match(/rgba?\(([^)]+)\)/);
          if (m) {
            const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
            const a = p.length > 3 ? p[3] : 1;
            if (a >= 0.85) return bg;      // opaque enough to be the ground
          }
          node = node.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      }

      for (const root of roots) {
        for (const el of root.querySelectorAll('*')) {
          // only elements holding their own visible text
          const own = [...el.childNodes]
            .filter((n) => n.nodeType === 3 && n.textContent.trim())
            .map((n) => n.textContent.trim()).join(' ');
          if (!own) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          // an element parked off-screen by a transform is still shown later
          if (el.closest('.sr-only')) continue;

          const size = parseFloat(cs.fontSize);
          const weight = Number(cs.fontWeight) || 400;
          const large = size >= 24 || (size >= 18.66 && weight >= 700);
          out.push({
            text: own.slice(0, 48),
            selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
              ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
            color: cs.color,
            bg: effectiveBg(el),
            large,
          });
        }
      }
      return out;
    });

    expect(pairs.length, 'found no text on any dark band — the selector is wrong').toBeGreaterThan(20);

    const failures = [];
    for (const p of pairs) {
      const fg = parseRGB(p.color), bg = parseRGB(p.bg);
      if (!fg || !bg) continue;
      const need = p.large ? 3 : 4.5;
      const r = ratio(fg.rgb, bg.rgb);
      if (r < need) {
        failures.push(`${r.toFixed(2)}:1 (need ${need}) — ${p.selector} — "${p.text}" ${p.color} on ${p.bg}`);
      }
    }
    expect(failures, `${failures.length} contrast failure(s)`).toEqual([]);
    console.log(`\n  ${path}: ${pairs.length} text/background pairs measured on dark bands, all pass.`);
  });
}
